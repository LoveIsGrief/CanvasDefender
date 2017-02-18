var generateFingerprint = document.getElementById('generate_fingerprint');
generateFingerprint.addEventListener('click', function () {
    self.port.emit("generate-fingerprint");
});
var infoUrl = document.getElementById('info_url');
infoUrl.addEventListener('click', function () {
    self.port.emit("open-info");
}, false);

self.port.on('panel-data-hash', function (dataHash) {
    var dataHashElem = document.getElementById('data_hash');
    dataHashElem.textContent = dataHash;
});