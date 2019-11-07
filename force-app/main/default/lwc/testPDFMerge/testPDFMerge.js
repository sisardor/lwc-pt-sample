/* eslint-disable no-console */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript } from 'lightning/platformResourceLoader';
import libUrl from '@salesforce/resourceUrl/lib';

export default class testPDFMerge extends LightningElement {
    showErrorMessage(error) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Error in WebViewer',
          message: error.body.message || 'error',
          variant: 'error',
        }),
      );
    }
    renderedCallback() {
        var self = this;
        if (this.uiInitialized) {
            return;
        }
        this.uiInitialized = true;
    
        Promise.all([
            loadScript(self, libUrl + '/core/CoreControls.js')
        ])
        .then(() => this.initUI())
        .catch(this.showErrorMessage);
      }
      initUI() {

        console.log('initUI');
    
      }
}