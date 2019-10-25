/* eslint-disable no-console */
import { LightningElement, wire, track } from 'lwc';
/** WVFileBrowserController.getFileList() Apex method */
import getFileList from '@salesforce/apex/WVFileBrowserController.getFileList';
/** WVFileBrowserController.getFileBlobById(id) Apex method */
import getFileBlobById from '@salesforce/apex/WVFileBrowserController.getFileBlobById';
/** WVFileBrowserController.createThumbnail(params) Apex method */
// import createThumbnail from '@salesforce/apex/WVFileBrowserController.createThumbnail';
/** WVFileBrowserController.createAttachment(params) Apex method */
import createAttachment from '@salesforce/apex/WVFileBrowserController.createAttachment';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/wvPubsub';
import Files from './constatnts';

const allowedExtensions = ["bmp", "gif", "docx", "xlsx", "pptx", "doc", "xls", "csv", "ppt", "htm", "html", "tif", "tiff", "jp2", "md", "txt", "pdf", "jpg", "jpeg", "png", "rtf", "odf", "odt", "odg", "odp", "ods", "dwg", "dgn", "dxf"];
export default class WvFileBrowser extends LightningElement {
  @track leftSide;
  @track rightSide;
  @track isListViewMode = true;
  @track thumbnails = {};
  @track activeTab = 'PDF';
  @track isLoading = true;
  @wire(CurrentPageReference) pageRef;
  selectedFileBlob;
  tabsList = [ 'PDF','Office', 'Images' ];
  @track selectedFileId;
  @track files;
  connectedCallback() {
    registerListener('thumbnailGenerated', this.handleThumbnailGenerated, this);
    console.log('%c connectedCallback ', 'background: red; color: white;');
  }

  disconnectedCallback() {
    unregisterAllListeners(this);
    console.log('%c disconnectedCallback ', 'background: red; color: white;');
  }

  wiredFilesResult;
  
  @wire(getFileList)
  loadFiles(result) {
    
    if (result.data && result.data.files && result.data.files.length) {
      console.log('%c loadFiles ', 'background: yellow; color: black;');
      console.log(JSON.parse(JSON.stringify(result.data)));
      const { contentVersion_attachments, attachments, files } = result.data;
      this.files = files;
      for (let index = 0; index < contentVersion_attachments.length; index++) {
        const throughRecord = contentVersion_attachments[index];
        const attachment = attachments.filter(item => item.Id === throughRecord.Attachment_Id__c);
        this.thumbnails[throughRecord.Content_Version_Id__c] = 'data:image/png;base64,' + attachment[0].Body;
      }
      this.processFiles();
    }

  }

  handleThumbnailGenerated(result) {
    this.thumbnails[result.id] = result.data;
    // console.log(JSON.parse(JSON.stringify(this.thumbnails)));
    createAttachment({ //String Name, ID ContentVersionId, String ContentType, String Body 
      Name: result.id, 
      ContentVersionId: result.id,
      ContentType: 'png',
      Body: result.data.replace('data:image/png;base64,', ''), })
      .then(res => {
        console.log(res);
      })
      .catch(error => {
        console.error(error.body.message);
        
      })
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
  handleFileSelect(event) {
    const { FileExtension: extension, Title: name, Id: id } = event.detail;
    
    getFileBlobById({ Id: id })
      .then(blobString => {
        this.selectedFileBlob = blobString
        fireEvent(this.pageRef, 'file_selected_blob', {
          blobString,
          extension,
          name,
        });

        this.selectedFileId = id;
      })
      .catch(error => {
        console.log(error.body.message);
      })
  }
  handleThumbError(event) {
    const { FileExtension: extension, Title: name, Id: id } = event.detail;
    getFileBlobById({ Id: id })
      .then(blobString => {
        this.selectedFileBlob = blobString;
        fireEvent(this.pageRef, 'generate_thumb', {
          blobString,
          extension,
          name,
          id,
        });
      })
      .catch(error => {
        console.log(error.body.message);
      });
  }

  handleSelectTab(event) {
    event.preventDefault();
    event.stopPropagation();
    this.activeTab = event.target.dataset.tab;
    this.processFiles();
  }

  get processedList() {
    return this.tabsList.map(label => {
      const computedClass = this.activeTab === label ? 'slds-tabs_default__item slds-is-active' : 'slds-tabs_default__item';
      return {
        label,
        computedClass,
      };
    });
  }

  toggleView(event) {
    this.isListViewMode = (event.detail.value === 'ListView') ? true : false;
  }
}