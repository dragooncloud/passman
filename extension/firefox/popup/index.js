var port = null;
var output = document.getElementById('popuptext');
var outputAuth = document.getElementById('output_auth');
var outputPasswords = document.getElementById('passwords');
var action_autofill = document.getElementById('action_autofill');
var lastPassword = null;

// auto-fille
action_autofill.addEventListener('click', (e) => {
  if (!lastPassword) {
    console.warn('cant autofill as no password is available');
    return;
  }
  if (!port) {
    console.warn('cant autofill as no connection to page is available');
    return;
  }
  port.postMessage({
    type: 'autofill',
    credentials: lastPassword,
  });
});

function flushSessionUi() {
  return browser.storage.sync.get()
    .then((state) => {
      if (!state) {
        console.warn('no sync storage available');
        return;
      }
      outputAuth.innerText = `You are logged in via ${state.network}`;
      outputAuth.setAttribute('title', state.access_token);
      return state;
    });
}

const Api = {
  'password-fields'(message) {
    if (message.fieldCount === 0) {
      output.innerText = 'Not a login page';
      return;
    }
    output.innerText = `login page for ${message.site}`;
    flushSessionUi()
      .then((auth) => {
        console.log('getting passwords for page');
        return fetch('https://us-central1-dragoon-passman.cloudfunctions.net/password_fetch', {
        method: 'post',
        body: JSON.stringify({ site: message.site }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth.network + ' ' + auth.access_token,
        }
      });
    })
    .then(r => r.json())
    .then((result) => {
      const pwds = result.relevant;
      outputPasswords.innerText = pwds.map(p => `${p.name} for ${p.host}`).toString();
      action_autofill.style.display = pwds.length === 0 ? 'none' : 'block';
      if (pwds.length === 0) {
        lastPassword = null;
      } else {
        console.log('last password set to', pwds[0]);
        lastPassword = pwds[0];
      }
    })
    .catch((err) => {
      console.error('unable to get passwords', err.message);
      outputPasswords.innerText = `Error: ${err.message}`;
    });
  },
  'auth-session'(message) {
    var session = JSON.parse(message.session);
    console.log('received auth session, caching', session);
    browser.storage.sync.set({
      'network': session.network,
      'access_token': session.access_token
    });
    flushSessionUi();
  }
};

const onMessageReceived = (e, a2, a3, a4) => {
  console.warn('message received', e, a2, a3, a4);
  var predicate = Api[e.type];
  if (typeof predicate === 'function') {
    predicate(e);
  } else {
    console.error('api not implemented', e.type);
  }
};

browser.runtime.onConnect.addListener((e) => {
  console.log('received connection from page ' + JSON.stringify(e));

  // remember socket connection
  port = e;
  port.onMessage.addListener(onMessageReceived);

  // now use the content script to determine if this page is a login page
  port.postMessage({
    type: 'check-for-password-fields' 
  });
});

// NOTE: detail is not accessible from page, so you can't put anything useful
// in here anyway (otherwise you get an 'access denied error')
browser.tabs.executeScript({
  code: `document.dispatchEvent(new CustomEvent('extension-installed', { detail: { }	}));`,
});