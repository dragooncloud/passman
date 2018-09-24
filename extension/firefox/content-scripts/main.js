/* ==============
CONTENT SCRIPT
================= */

console.log('attached dragoon extension');

var port = null;

const Api = {
  /**
   * Extension is asking if there are any password fields on this page
   */
  'check-for-password-fields': function () {
    console.log('check-for-password-fields()');
    try {
      var passwordFields = Array.prototype.slice
        .call(document.getElementsByTagName('input'), 0)
        .filter(i => i.type === 'password');
      console.log('found password fields', passwordFields.length);
      // send to extension
      port.postMessage({
        type: 'password-fields', 
        fieldCount: passwordFields.length,
        site: document.location.host 
      });
    } catch(e) {
      console.error(e.message);
    }
  }
}

document.addEventListener('extension-installed', () => {
  port = browser.runtime.connect();
  port.onMessage.addListener((message, socket) => {
    console.log('message received from extension', message, socket);
    // handle this message via the Api object declared above
    const predicate = Api[message.type];
    if (typeof predicate === 'function') {
      console.log('calling api predicate', message.type);
      predicate(message);
    } else {
      console.log('unknonw api request', message.type);
      port.postMessage({ type: 'error', message: 'Not implemented message', orig: message });
    }
  });
});