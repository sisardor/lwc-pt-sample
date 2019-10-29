window.sampleL = 'demo:sisakov@pdftron.com:758c34bd0164a412c3d0733be2663fcfa35b809d67c9c77c02'; // enter your key here so that the samples will run

if (!window.sampleL) {
  window.sampleL = localStorage.getItem('wv-sample-license-key') || window.location.search.slice(5);
  if (!window.sampleL) {
    window.sampleL = window.prompt('No license key is specified.\nPlease enter your key here or add it to license-key.js inside the samples folder.', '');
    if (window.sampleL) {
      localStorage.setItem('wv-sample-license-key', window.sampleL);
    }
  }
}



const resourceURL = '/resource/'

window.CoreControls.forceBackendType('ems');
// office workers
window.CoreControls.setOfficeWorkerPath(resourceURL + 'office')
window.CoreControls.setOfficeAsmPath(resourceURL + 'officeAsm');
window.CoreControls.setOfficeResourcePath(resourceURL + 'officeResource');
// pdf workers
window.CoreControls.setPDFWorkerPath(resourceURL)
window.CoreControls.setPDFResourcePath(resourceURL + 'resource')
window.CoreControls.setPDFAsmPath(resourceURL + 'asm')

let __documentId = null;

window.addEventListener('viewerLoaded', function() {
  docViewer.on('documentLoaded', function(e) {
    loadxfdfStrings(__documentId);
  });

  var annotManager = docViewer.getAnnotationManager();
  // Save when annotation change event is triggered (adding, modifying or deleting of annotations)
  annotManager.on('annotationChanged', function(annotations, action, event) {
    if (event && event.imported) return;
    const xfdfString = annotManager.getAnnotCommand();
    annotations.forEach(function(annot) {
      savexfdfString(
        { action, 
          documentId: __documentId, 
          annotationId: annot.Id,
          xfdfString 
        })
    });
  });
}, false);


window.addEventListener("message", receiveMessage, false);

const MIME_TYPE = {
  'pdf': 'application/pdf',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

let promise = null


function receiveMessage(event) {
  if (event.isTrusted && typeof event.data === 'object') {
    switch (event.data.type) {
      case 'OPEN_DOCUMENT':
        event.target.readerControl.loadDocument(event.data.file)
        break;
      case 'OPEN_DOCUMENT_BLOB':
        const { blobString, extension, name, documentId, annotationUser } = event.data.payload;
        const filename = name + '.' + extension;
        var blob = new Blob([_base64ToArrayBuffer(blobString)], {
          type: MIME_TYPE[extension]
        });
        event.target.readerControl.loadDocument(blob, { extension, filename, documentId })
        __documentId = documentId;
        docViewer.getAnnotationManager().setCurrentUser(annotationUser)
        break;
      case 'GENEREATE_THUMB':
        if (promise) {
          promise = promise.then(function(result) {
            return new Promise((resolve, reject) => {
              generateThumbnail(event.data.payload, resolve, reject);
            });
          });
        } else {
          promise = new Promise(function(resolve, reject) {
            generateThumbnail(event.data.payload, resolve, reject);
          });
        }
        
        break;
      case 'LOAD_ANNOTATIONS_FINISHED':
        drawAnnotations(event.data.result);
        break;
      default:
        break;
    }
  }
}

function _base64ToArrayBuffer(base64) {
  var binary_string =  window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array( len );
  for (var i = 0; i < len; i++)        {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function generateThumbnail(payload, resolve, reject) {
  const { blobString, extension, name, id } = payload; 
  var options = { 
    l: window.sampleL/* license key here */,
    extension,
  };
  var blob = new Blob([_base64ToArrayBuffer(blobString)], {
    type: MIME_TYPE[extension]
  });
  var source = blob;
  var documentPromise = CoreControls.createDocument(source, options);
  documentPromise.then(function(doc) {
    doc.loadThumbnailAsync(0, function(canvas, index) {
        var dataURL = canvas.toDataURL();
        var result = {
          data: dataURL,
          id: id,
        }
        parent.postMessage({type: 'GENEREATED_THUMB_DATA', payload: result });
        if (resolve) return resolve();
      }
    );
  })
  .catch(error => {
    console.error(error);
    if (resolve) return resolve();
  });
}

function loadxfdfStrings(documentId) {
  parent.postMessage({type: 'LOAD_ANNOTATIONS', payload: {documentId} });
}

function savexfdfString(payload) {
  parent.postMessage({type: 'SAVE_ANNOTATIONS', payload });
}

function drawAnnotations(data) {
  var annotManager = docViewer.getAnnotationManager();
  data.forEach(col => {
    const annotations = annotManager.importAnnotCommand(col.xfdfString__c);
    annotManager.drawAnnotationsFromList(annotations);
  });
}