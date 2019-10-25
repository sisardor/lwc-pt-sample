/* global PDFTron */
/* eslint-disable no-console */
import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { loadScript } from 'lightning/platformResourceLoader';
import libUrl from '@salesforce/resourceUrl/lib';
import myfilesUrl from '@salesforce/resourceUrl/webviewerFiles';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/wvPubsub';

export default class WebViewerComp extends LightningElement {
  @wire(CurrentPageReference) pageRef;

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
    this.iframeWindow.postMessage({type: 'OPEN_DOCUMENT_BLOB', payload })
  }
  handleFileSelected(file) {
    this.iframeWindow.postMessage({type: 'OPEN_DOCUMENT', file: file})
  }
  handleGenereateThumb(payload) {
    this.iframeWindow.postMessage({type: 'GENEREATE_THUMB', payload })
  }
  handleReceiveMessage(event) {
    if (event.isTrusted && typeof event.data === 'object') {
      switch (event.data.type) {
        case 'GENEREATED_THUMB_DATA':
          console.log(JSON.parse(JSON.stringify(event.data)));
          fireEvent(this.pageRef, 'thumbnailGenerated', event.data.payload);
          break;
        default:
          break;
      }
    }
  }
  divHeight = 600;
  uiInitialized = false;
  renderedCallback() {
    var self = this;
    if (this.uiInitialized) {
        return;
    }
    this.uiInitialized = true;

    Promise.all([
        loadScript(self, libUrl + '/webviewer.min.js')
    ])
    .then(() => {
       this.initUI();
    })
    .catch(error => {
      console.error(error)
      this.dispatchEvent(
          new ShowToastEvent({
              title: 'Error loading WebViewer',
              message: 'error',
              variant: 'error',
          }),
      );
      // this.initUI();
      // console.error
    });
  }

  initUI() {
    let _this = this;
    var myObj = { libUrl: libUrl };
    // var url = myfilesUrl + '/webviewer-demo-annotated.pdf';
    // var url = myfilesUrl + '/webviewer-demo-annotated.xod';
    // var url = myfilesUrl + '/word.docx';

    const viewerElement = this.template.querySelector('div')
    // eslint-disable-next-line no-unused-vars
    const viewer = new PDFTron.WebViewer({
      path: libUrl, // path to the PDFTron 'lib' folder on your server
      custom: JSON.stringify(myObj),
      // initialDoc: url,
      // preloadWorker: 'pdf',
      config: myfilesUrl + '/config.js',
      // fullAPI: true,
      enableFilePicker: true,
    }, viewerElement);

    viewerElement.addEventListener('ready', function() {
      _this.iframeWindow = viewerElement.querySelector('iframe').contentWindow;
    })

  }
}
