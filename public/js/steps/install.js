(function() {
  EXTENION_INSTALLED_CAUGHT = false;

  // when the user clicks the install button
  // show the hint where the extension will appear
  $('#action_install').on('click', (e) => {
    $('#hint_install').show();
  });
  
  // when loaded show the user how to install this extension
  document.addEventListener('stepped', (e) => {
    if (e.detail.stepName !== 'install') {
      return;
    }

    // the URLs this application is installed to, based on browser being used
    const InstallExtensionUrls = {
      'firefox': 'https://addons.mozilla.org/en-GB/firefox/addon/website-guesser/',
      // todo!
    }

    // set correct link to install
    var browserName = BrowserDetector.getBrowserName();
    $('#action_install').unbind('click').bind('click', () => {
      window.open(InstallExtensionUrls[browserName]);
      $('#hint_install').show();
    });

    // called by the web extension when it is installed
    document.addEventListener('extension-installed', (e) => {
      // stop listening after first time
      if (EXTENION_INSTALLED_CAUGHT) {
        return;
      }
      EXTENION_INSTALLED_CAUGHT = true;
      return proceedToStep('subscription');
    });
  });
})();