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
  const chooseTemplate = (viewModel) => {
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
    console.log('view model update', viewModel);
    // render the template
    var rendered = Mustache.render(chooseTemplate(viewModel), viewModel);
    // render to user
    document.getElementById('canvas').innerHTML = rendered;
    // now refresh the passwords list
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
  });

  // publish initial/empty state (e.g. not logged in)
  window.emit('view-model', { });

})();