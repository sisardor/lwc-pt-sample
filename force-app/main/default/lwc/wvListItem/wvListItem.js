import { LightningElement, api } from 'lwc';

export default class WvListItem extends LightningElement {
    @api file;
    @api _isLoading = false;
    @api selected;
    get cssClass(){
        return (this.selected === this.file.Id) ? 'list-view-row active': 'list-view-row';
    }
    get isLoading() {
        if (this.selected === this.file.Id) {
          this._isLoading = false;
        }
        return this._isLoading;
    }
    get fileIcon() {
        if (this.file.FileExtension === 'pdf') 
            return 'doctype:pdf';
        else if (this.file.FileExtension === 'docx')
            return 'doctype:word';
        return 'doctype:image';
    }
    handleOpenFileClick() {
        this._isLoading = true;
        // Creates the event with the contact ID data.
        const selectedEvent = new CustomEvent('select', { detail: this.file });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }
}