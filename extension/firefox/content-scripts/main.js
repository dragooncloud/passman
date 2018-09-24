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
  },

  /**
   * credentials to be auto-filled
   */
  autofill(message) {
    const {credentials} = message;
    var passwordFields = Array.prototype.slice
        .call(document.getElementsByTagName('input'), 0)
        .filter(i => i.type === 'password');
    var userNameFields = Array.prototype.slice
        .call(document.getElementsByTagName('input'), 0)
        .filter(i => {
          var usernameId = (i.id || i.className || '').toLowerCase().indexOf('username') !== -1;
          if (usernameId) {
            return true;
          }
          var autoCompleteUsername = (i.autocomplete || '').toLowerCase().indexOf('username') !== -1;
          if (autoCompleteUsername) {
            return true;
          }
          var isEmail = i.type === "email";
          return isEmail;
        });
    console.log('setting credentials', credentials.username, credentials.password);
    passwordFields.forEach((elem) => elem.value = message.credentials.password);
    userNameFields.forEach((elem) => elem.value = message.credentials.username);
  },
}

document.addEventListener('extension-installed', () => {
  // build a 2-way connection to the extension
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
  // TODO: is there a better place for this?
  // need to pass auth information to extension
  if (document.location.host === 'localhost:5000' || document.location.host == 'password.dragoon.cloud') {
    console.log('this is a special dragoon page!');
    const provider = window.localStorage.getItem('auth-provider');
    if (provider) {
      const session = window.localStorage.getItem(provider);
      console.log('sending auth info to extension', session);
      port.postMessage({ type: 'auth-session', session });
    }
  }
});