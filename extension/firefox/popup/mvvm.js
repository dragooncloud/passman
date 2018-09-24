(function() {

  // view model binding
  var viewModel = {};
  var templateHtml = document.getElementById('template').innerHTML;
  Mustache.parse(templateHtml);
  document.addEventListener('view-model', (e) => {
    viewModel = Object.assign({}, viewModel, e.detail);
    // wipe out error if not in most recent update
    if (!e.detail.error) {
      viewModel.error = null;
    }
    console.log('view model update', viewModel);
    var rendered = Mustache.render(templateHtml, viewModel);
    document.getElementById('canvas').innerHTML = rendered;
    setTimeout(() => {
      var autoFills = Array.prototype.slice.call(document.getElementsByClassName('auto-fill-option'), 0);
      autoFills.forEach((a) => a.addEventListener('click', (e) => {
        const elem = e.target;
        const host = elem.getAttribute('data-host');
        const name = elem.getAttribute('data-name');
        document.dispatchEvent(new CustomEvent('request-auto-fill', {detail: { name, host }}));
      }));
    }, 200);
  });

  // convenience method
  window.emit = (eventName, model) => {
    document.dispatchEvent(new CustomEvent('view-model', { detail: model }));
  };

  // publish an initial model
  window.emit('view-model', {
      title: 'Dragoon',
      error: 'Visit <a href="https://passwords.dragoon.cloud">passwords.dragoon.cloud</a> to first sign-in',
  });

})();