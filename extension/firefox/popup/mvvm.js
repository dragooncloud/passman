(function() {
  // utility functions
  const etoa = (elementList) => Array.prototype.slice.call(elementList, 0);
  // simplfy sending events
  window.emit = (eventName, model) => {
    document.dispatchEvent(new CustomEvent(eventName, { detail: model }));
  };

  // view model binding
  var viewModel = {};

  // template choices
  var templateHtml = document.getElementById('template').innerHTML;
  var noLogintemplateHtml = document.getElementById('no-login-template').innerHTML;
  var noLoginFormsDetectedTemplateHtml = document.getElementById('no-login-forms-detected-template').innerHTML;
  var scanningPageTemplate = document.getElementById('scanning-page-template');
  const chooseTemplate = (viewModel) => {
    if (viewModel.isScanningPage) {
      return scanningPageTemplate;
    }
    if (!viewModel.network) {
      return noLogintemplateHtml;
    }
    if (!viewModel.isLoginPage) {
      return noLoginFormsDetectedTemplateHtml;
    }
    return templateHtml;
  };
  Mustache.parse(templateHtml);
  Mustache.parse(noLogintemplateHtml);
  Mustache.parse(noLoginFormsDetectedTemplateHtml);

  // listen out for state changes so page can be rebuilt
  document.addEventListener('view-model', (e) => {
    // extend the existing state
    viewModel = Object.assign({}, viewModel, e.detail);
    // wipe out error if not in most recent update
    if (!e.detail.error) {
      viewModel.error = null;
    }
    if (!e.detail.init) {
      viewModel.init = false;
    }
    console.log('view model update', viewModel);
    // render the template
    var rendered = Mustache.render(chooseTemplate(viewModel), viewModel);
    // render to user
    document.getElementById('canvas').innerHTML = rendered;
    // attach event handlers defined in template (class=action data-event="EVENT-TO-EMIT")
    setTimeout(function() {
      const elemAddPasswordButtons = document.getElementsByClassName('action');
      for (let i = 0; i < elemAddPasswordButtons.length; i += 1) {
        const elemAddPasswordButton = elemAddPasswordButtons[i];
        const eventName = elemAddPasswordButton.getAttribute('data-event');
        if (eventName) {
          elemAddPasswordButton.addEventListener('click', () => window.emit(eventName, viewModel));
        }
      }
    }, 300);
    // now refresh the passwords list
    if (viewModel.init) {
      setTimeout(() => {
        var autoFills = etoa(document.getElementsByClassName('pwd-choice'));
        autoFills.forEach((a) => a.addEventListener('click', (e) => {
          const elem = e.currentTarget;
          // from the element clicked, grab the identifiers so we know which one they clicked
          const host = elem.getAttribute('data-host');
          const name = elem.getAttribute('data-name');
          // this pop knows how to handle this event, so we'll broadcast a request for it to do so
          window.emit('request-auto-fill', { name, host });
        }));
      }, 200);
    }
  });

  // publish initial/empty state (e.g. not logged in)
  window.emit('view-model', { init: true });

})();