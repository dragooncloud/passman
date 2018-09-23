document.addEventListener('stepped', (e) => {
  if (e.detail.stepName !== 'browser') {
    return;
  }

  // update ui with correct instructions for this browser
  var browserName = BrowserDetector.getBrowserName();
  $('#browserIcon').attr('class', 'fab fa-' + browserName);
  $('#browser-content .main').load('/partials/browsers/' + browserName + '.html');
});