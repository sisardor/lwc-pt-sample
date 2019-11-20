import { LightningElement, wire, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
/** WebViewerController.getFileList() Apex method */
import getFileList from '@salesforce/apex/WebViewerController.getFileList';
/** WebViewerController.getFileBlobById(id) Apex method */
import getFileBlobById from '@salesforce/apex/WebViewerController.getFileBlobById';
/** WebViewerController.createAttachment(params) Apex method */
import createAttachment from '@salesforce/apex/WebViewerController.createAttachment';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/wvPubsub';
import Files, { allowedExtensions } from './constatnts';


export default class WvFileBrowser extends LightningElement {
  @track searchTerm = '';
  @api listViewMode;
  @api cssMinHeight;
  @track listViewMode = localStorage.getItem('PDFTron_wvFileBrowser_set1') || 'List View';
  @track leftSide;
  @track rightSide;
  @track thumbnails = {};
  @track activeTab = 'PDF';
  @track isLoading = true;
  @wire(CurrentPageReference) pageRef;
  selectedFileBlob;  
  wiredFilesResult;
  tabsList = [ 'PDF','Office', 'Images' ];
  @track selectedFileId;

  @track files;
  connectedCallback() {
    registerListener('thumbnailGenerated', this.handleThumbnailGenerated, this);
    this.showErrorMessage = this.showErrorMessage.bind(this);
  }
  disconnectedCallback() {
    unregisterAllListeners(this);
  }
  @wire(getFileList, {searchTerm: '$searchTerm'})
  loadFiles(result) {
    if (result.data && result.data.files) {

      // console.log('%c loadFiles ', 'background: yellow; color: black;');
      console.log(JSON.parse(JSON.stringify(result.data)));
      const { contentVersion_attachments = [], attachments = [], files } = result.data;
      this.files = files;
      for (let index = 0; index < contentVersion_attachments.length; index++) {
        const throughRecord = contentVersion_attachments[index];
        const attachment = attachments.filter(item => item.Id === throughRecord.Attachment_Id);
        if (attachment && attachment.length) {
          this.thumbnails[throughRecord.ContentVersion_Id] = 'data:image/png;base64,' + attachment[0].Body;
        }
      }
      this.processFiles();
    }
  }
  get minHeight() {
    return 'min-height:' + (this.cssMinHeight - 56) +'px;';
  }
  showErrorMessage(error) {
    this.dispatchEvent(
      new ShowToastEvent({
        title: 'Error in WebViewer',
        message: error.body.message || 'error',
        variant: 'error',
      }),
    );
  }
  handleThumbnailGenerated(result) {
    this.thumbnails[result.id] = result.data;
    // console.log(JSON.parse(JSON.stringify(this.thumbnails)));
    createAttachment({ //String Name, ID ContentVersionId, String ContentType, String Body 
      Name: result.id, 
      ContentVersionId: result.id,
      ContentType: 'png',
      Body: result.data.replace('data:image/png;base64,', ''), }) 
      //.then(console.log)
      .catch(this.showErrorMessage);
  }
  processFiles() {
    let finalFiles = this.files.filter(({ Title, /*thumb,*/ FileExtension }) => {
      // if (!Title || !thumb) return false;
      if (!Title) return false;
      // const { active } = this.state;

      const extensions = Files[this.activeTab];
      const s = Title.split('.');
      const ext = FileExtension || s[s.length - 1];

      if (allowedExtensions.indexOf(ext) === -1) return false;
      return extensions.indexOf(ext) > -1;
    });
    let leftSide = [];
    let rightSide = [];

    finalFiles = finalFiles.sort((a, b) => {

      if (a.forceSort > b.forceSort) return -1;
      if (a.forceSort < b.forceSort) return 1;
      if (a.formattedName < b.formattedName) return -1;
      if (a.formattedName > b.formattedName) return 1;
      if (a.Title < b.Title) return -1;
      if (a.Title > b.Title) return 1;
      return 0;
    });

    for (let i = 0; i < finalFiles.length; i++) {
      if (i % 2 === 0) leftSide.push(finalFiles[i]);
      else rightSide.push(finalFiles[i]);
    }
    this.leftSide = leftSide;
    this.rightSide = rightSide;
    this.isLoading = false;
  }
  handleSearchTermChange(event) {
		// Debouncing this method: do not update the reactive property as
		// long as this function is being called within a delay of 300 ms.
		// This is to avoid a very large number of Apex method calls.
		window.clearTimeout(this.delayTimeout);
		const searchTerm = event.target.value;
		// eslint-disable-next-line @lwc/lwc/no-async-operation
		this.delayTimeout = setTimeout(() => {
			this.searchTerm = searchTerm;
		}, 300);
	}
  handleFileSelect(event) {
    const { FileExtension: extension, Title: name, Id } = event.detail;
    
    getFileBlobById({ Id }).then(blobString => {
        this.selectedFileBlob = blobString;
        this.selectedFileId = Id;
        fireEvent(this.pageRef, 'file_selected_blob', {blobString, extension, name, documentId: Id,});
      })
      .catch(this.showErrorMessage);
  }
  handleThumbError(event) {
    const { FileExtension: extension, Title: name, Id } = event.detail;
    getFileBlobById({ Id }).then(blobString => {
        this.selectedFileBlob = blobString;
        fireEvent(this.pageRef, 'generate_thumb', { blobString, extension, name, id: Id });
      })
      .catch(this.showErrorMessage);
  }
  handleSelectTab(event) {
    event.preventDefault();
    event.stopPropagation();
    this.activeTab = event.target.dataset.tab;
    this.processFiles();
  }
  toggleView(event) {
    localStorage.setItem('PDFTron_wvFileBrowser_set1', event.detail.value);
    this.listViewMode = event.detail.value;
  }
  get processedList() {
    return this.tabsList.map(label => {
      const computedClass = this.activeTab === label ? 'slds-tabs_default__item slds-is-active' : 'slds-tabs_default__item';
      return {  label, computedClass, };
    });
  }
  get isListViewMode() {
    return (this.listViewMode === 'List View') ? true : false;
  }
}