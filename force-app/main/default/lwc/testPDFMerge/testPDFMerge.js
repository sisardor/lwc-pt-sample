/* global CoreControls */
/* eslint-disable no-console */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript } from 'lightning/platformResourceLoader';
import libUrl from '@salesforce/resourceUrl/lib';
/** WebViewerController.getFileBlobById(id) Apex method */
import getFileBlobById from '@salesforce/apex/WebViewerController.getFileBlobById';

export default class testPDFMerge extends LightningElement {
  connectedCallback() {
      this.showErrorMessage = this.showErrorMessage.bind(this);
    }
    showErrorMessage(error) {
      if (error) {
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Error in WebViewer',
            message: error.message || error.body.message || 'error',
            variant: 'error',
          }),
        );
      }

      console.error(error);
      
    }
    renderedCallback() {
        var self = this;
        if (this.uiInitialized) {
            return;
        }
        this.uiInitialized = true;
    
        Promise.all([
          // loadScript(self, libUrl + '/core/external/jquery-3.2.1.min.js'),
          loadScript(self, libUrl + '/core/CoreControls.js')
        ])
        .then(() => this.initUI())
        .catch(this.showErrorMessage);
      }
      initUI() {
        // CoreControls.forceBackendType('ems');
        const resourceURL = '/resource/'+new Date().getTime()+'/'
        // pdf workers
        CoreControls.setWorkerPath(libUrl + '/core');
        CoreControls.setPDFWorkerPath(resourceURL)
        CoreControls.setPDFResourcePath(resourceURL + 'resource')
        CoreControls.setPDFAsmPath(resourceURL + 'asm')
        console.log('initUI', CoreControls);
        CoreControls.disableEmbeddedJavaScript();
        const doc = new CoreControls.Document('file.pdf', 'pdf');
        console.log(doc);
        const Id = '068S0000000lFvFIAU';
        getFileBlobById({ Id }).then(blobString => {         
          const arrayBuffer = _base64ToArrayBuffer(blobString);
          console.log(arrayBuffer);
          const blob = new Blob([arrayBuffer], { type: 'application/pdf'});
          console.log(blob)
          
          CoreControls.getDefaultBackendType().then((backendType) => {
            let partRetriever = new CoreControls.PartRetrievers.ArrayBufferPdfPartRetriever(arrayBuffer);
            const options = {
              workerTransportPromise: CoreControls.initPDFWorkerTransports(backendType, {}),
              
            };


            console.log(partRetriever)
            const callback = (err) => {
              if (err) {
                console.error('Could not open file, please try again');
              }
              console.log('loaded');
              

            };
            doc.loadAsync(partRetriever, callback, options)
          });
         
          
        })
        .catch(this.showErrorMessage);
      }
}


function _base64ToArrayBuffer(base64) {
  var binary_string =  window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array( len );
  for (let i = 0; i < len; i++)        {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}