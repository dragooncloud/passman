// handle certificate page
document.addEventListener('stepped', function(e) {
  if (e.detail.stepName !== 'certificate') {
    return;
  }
  var Helpers = {
    getCertificateString(certificate) {
      var certificateString = certificate.publicKey;
      var privateKeyString = certificate.privateKey;
      var resultString = "-----BEGIN CERTIFICATE-----\r\n";
      resultString = `${resultString}${formatPEM(window.btoa(certificateString))}`;
      resultString = `${resultString}\r\n-----END CERTIFICATE-----\r\n`;
      resultString = `${resultString}\r\n-----BEGIN PRIVATE KEY-----\r\n`;
      resultString = `${resultString}${formatPEM(window.btoa(privateKeyString))}`;
      resultString = `${resultString}\r\n-----END PRIVATE KEY-----\r\n`;
      return resultString;
    },
    downloadCertificates() {
      var certs = JSON.parse(window.localStorage.getItem('certificate'));
      var stringToDownload = this.getCertificateString(certs);
      var blob = new Blob([stringToDownload], {type: 'application/octet-stream'}); // pass a useful mime type here
      var url = URL.createObjectURL(blob);
      document.location = url;
    }
  };

  new Promise((resolve, reject) => {
    // if there's a certificate in the cache always use this    
    var existingVersion = window.localStorage.getItem('certificate');
    if (existingVersion) {
      return resolve(JSON.parse(existingVersion));
    }
    // generate using PKI.js
    return window.createCertificateInternal().then(res => ({ 
      publicKey: String.fromCharCode.apply(null, new Uint8Array(res.certificateBuffer)),
      privateKey: String.fromCharCode.apply(null, new Uint8Array(res.privateKeyBuffer)),
    }));
  })
  .then((res) => {
    // store the certificate in the current application context/state
    document.dispatchEvent(
      new CustomEvent('context-update', {
      detail: { certificate: res },
    }));
    // store away to browser persistance
    window.localStorage.setItem('certificate', JSON.stringify(res)); // store
    // update ui and allow user to back-up these keys
    $('#title_certificate').text('Back-up your certificates');
    $('#summary_certificate').text('Click the button below and store the file downloaded in a super-safe place.');
    $('#certificate_actions').removeClass('hidden')
    $('#action_backupFromCertificate').on('click', Helpers.downloadCertificates);
    $('#action_proceedFromCertificate').on('click', () => proceedToStep('browser'));
  })
  .catch((error) => {
    // unable to create x509 cert
    console.error('error generating certificate pairs', error);
  });
});
