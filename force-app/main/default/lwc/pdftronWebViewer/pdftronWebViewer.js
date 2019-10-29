/* global PDFTron */
import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { loadScript } from 'lightning/platformResourceLoader';
import libUrl from '@salesforce/resourceUrl/lib';
import myfilesUrl from '@salesforce/resourceUrl/webviewerFiles';
import USER_ID from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/User.Name';
import FIRST_NAME_FIELD from '@salesforce/schema/User.FirstName';
import EMAIL_FIELD from '@salesforce/schema/User.Email';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/wvPubsub';
/** WebViewerController.getAnnotations(id) Apex method */
import getAnnotations from '@salesforce/apex/WebViewerController.getAnnotations';
/** WebViewerController.saveAnnotations(params) Apex method */
import saveAnnotations from '@salesforce/apex/WebViewerController.saveAnnotations';

export default class WebViewerComp extends LightningElement {
  divHeight = 600;
  uiInitialized = false;
  @wire(CurrentPageReference) pageRef;
  @track email;
  @track name = 'UNKNOWN'; 
  @track firstName;
  @wire(getRecord, { recordId: USER_ID, fields: [NAME_FIELD, FIRST_NAME_FIELD, EMAIL_FIELD]}) 
  wireuser({ error, data}) {
      if (error) {
        this.error = error; 
        this.uiInitialized(error);
      } else if (data) {
          this.email = data.fields.Email.value;
          this.name = data.fields.Name.value;
          this.firstName = data.fields.FirstName.value;
      }
  }
  connectedCallback() {
      registerListener('file_seleceted', this.handleFileSelected, this);
      registerListener('file_selected_blob', this.handleFileSelectedBlob, this);
      registerListener('generate_thumb', this.handleGenereateThumb, this);
      window.addEventListener('message', this.handleReceiveMessage.bind(this), false);
  }
  disconnectedCallback() {
      unregisterAllListeners(this);
      window.removeEventListener('message', this.handleReceiveMessage, true); 
  }
  handleFileSelectedBlob(payload) {
    payload.annotationUser = this.name;
    this.iframeWindow.postMessage({type: 'OPEN_DOCUMENT_BLOB', payload })
  }
  handleFileSelected(file) {
    this.iframeWindow.postMessage({type: 'OPEN_DOCUMENT', file: file})
  }
  handleGenereateThumb(payload) {
    this.iframeWindow.postMessage({type: 'GENEREATE_THUMB', payload })
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
  handleReceiveMessage(event) {
    const me = this;
    if (event.isTrusted && typeof event.data === 'object') {
      switch (event.data.type) {
        case 'GENEREATED_THUMB_DATA':
          fireEvent(this.pageRef, 'thumbnailGenerated', event.data.payload);
          break;
        case 'LOAD_ANNOTATIONS':
          getAnnotations(event.data.payload).then(result => {
            me.iframeWindow.postMessage({type: 'LOAD_ANNOTATIONS_FINISHED', result })
          }).catch(this.showErrorMessage)
          break;
        case 'SAVE_ANNOTATIONS':
          saveAnnotations(event.data.payload).catch(this.showErrorMessage);
          break;
        default:
          break;
      }
    }
  }
  renderedCallback() {
    var self = this;
    if (this.uiInitialized) {
        return;
    }
    this.uiInitialized = true;

    Promise.all([
        loadScript(self, libUrl + '/webviewer.min.js')
    ])
    .then(() => this.initUI())
    .catch(this.showErrorMessage);
  }
  initUI() {
    let _this = this;
    var myObj = { libUrl: libUrl };
    var url = myfilesUrl + '/webviewer-demo-annotated.pdf';
    // var url = myfilesUrl + '/webviewer-demo-annotated.xod';
    // var url = myfilesUrl + '/word.docx';
    
    const viewerElement = this.template.querySelector('div')
    // eslint-disable-next-line no-unused-vars
    const viewer = new PDFTron.WebViewer({
      path: libUrl, // path to the PDFTron 'lib' folder on your server
      custom: JSON.stringify(myObj),
      initialDoc: url,
      // preloadWorker: 'pdf',
      config: myfilesUrl + '/config.js',
      fullAPI: true,
      enableFilePicker: true,
    }, viewerElement);

    viewerElement.addEventListener('ready', function() {
      _this.iframeWindow = viewerElement.querySelector('iframe').contentWindow;
    })

  }
}