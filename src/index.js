const pdfJsLib = require('pdfjs-dist');
const cmapPath = 'pdfjs-dist/cmaps';

function app() {
  const element = document.createElement('div');
  element.id = 'app';
  return element;
}

document.body.appendChild(app());

function inputComponent() {
  let input = document.createElement('input');
  input.type = 'file';
  input.id = 'fileinput';
  input.onchange = function() {
    let file = input.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let pdfData = atob(reader.result.substring(reader.result.indexOf(',') + 1));
      previewPdf(pdfData);
    };
  };
  let app = document.getElementById('app');
  app.appendChild(input);
}

function generatePdfData(fileUrl) {
  let reader = new FileReader();
  reader.readAsDataURL(fileUrl);
  reader.onload = () => {
    let pdfData = atob(reader.result.substring(reader.result.indexOf(',') + 1));
    return pdfData;
  }
}

let loadingTask;

function previewPdf(pdfData) {
  loadingTask = pdfJsLib.getDocument({
    data: pdfData,
    cMapUrl: cmapPath,
    cMapPacked: true
  });
  loadingTask.promise.then((pdf) => {
    loadFinished = true;
    let pages = [];
    while (pages.length < pdf.numPages) pages.push(pages.length + 1);
    return Promise.all(pages.map(function(num) {
      let div = document.createElement("div");
      document.body.appendChild(div);
      return pdf.getPage(num).then(generateThumbnail)
                .then(function (canvas) {
                  div.appendChild(canvas);
                });
    }));
  }).catch(console.error);
}

function generateThumbnail(page) {
  let vp = page.getViewport(1);
  let canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  let scale = Math.min(canvas.width / vp.width, canvas.height / vp.height);
  return page.render({canvasContext: canvas.getContext("2d"), viewport: page.getViewport(scale)}).promise.then(function () {
    return canvas;
  });
}

let pdfAppBridge;

function previewPdfFromFile(file) {
  console.log('Loading PDF file ' + file);
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    let pdfData = atob(reader.result.substring(reader.result.indexOf(',') + 1));
    previewPdf(pdfData);
    pdfAppBridge.jsLoaded();
  };
}

function pdfAppInitialize() {
    if (typeof qt != 'undefined') new QWebChannel(qt.webChannelTransport, function(channel) {
        pdfAppBridge = channel.objects.pdfAppbridge;
        pdfAppBridge.jsInitialized();
    });
}

function pdfAppFetchDestinations() {
  loadingTask.getDestinations().then(function(destinations) {
    pdfAppBridge.jsReportDestinations(Object.keys(destinations));
  });
}

function pdfAppClose() {
  loadingTask.destroy();
  pdfAppBridge.jsClosed();
}
