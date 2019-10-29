/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';
const THUMBSIZES = [
  'THUMB240BY180'
]
export default class WvGalleryItem extends LightningElement {
  @api file;
  @api thumbnails;
  @api _isLoading = false;
  @api selected;
  @track error;
  get isError() {
    if (this.thumbnails && this.thumbnails[this.file.Id]) {
      this.error = false;
      return false;
    }
    return this.error;
  }
  get cssClass(){
    return (this.selected === this.file.Id) ? 'GalleryItem active': 'GalleryItem';
  }
  get isLoading() {
    if (this.selected === this.file.Id) {
      this._isLoading = false;
    }
    return this._isLoading;
  }
  get thumbUrl() {
    if (this.thumbnails && this.thumbnails[this.file.Id]) {
      return this.thumbnails[this.file.Id];
    }
    return '';
    // return `/sfc/servlet.shepherd/version/renditionDownload?rendition=${THUMBSIZES[0]}&versionId=${this.file.Id}`;
  }
  get altFilename() {
    return this.file.Title + '.' + this.file.FileExtension;
  }
  get filename() {
    return this.file.Title + '.' + this.file.FileExtension;
  }
  handleOpenFileClick() {
    this._isLoading = true;
    // Creates the event with the contact ID data.
    const selectedEvent = new CustomEvent('select', { detail: this.file });
    // Dispatches the event.
    this.dispatchEvent(selectedEvent);
  }
  handleImageError() {    
    this.error = true;
    // Creates the event with the contact ID data.
    const selectedEvent = new CustomEvent('thumberror', { detail: this.file });
    // Dispatches the event.
    this.dispatchEvent(selectedEvent);
  }
}