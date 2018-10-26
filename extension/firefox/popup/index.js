var port = null;
var lastPasswords = [];

// auto-fill the current site based on user chosen credentials
document.addEventListener('request-auto-fill', (e) => {
  if (!lastPasswords) {
    console.warn('cant autofill as no passwords are available');
    return;
  }
  const credentials = lastPasswords.filter(p => p.name === e.detail.name && p.host === e.detail.host);
  if (credentials.length === 0) {
    console.warn('no credentials found to reference', e.detail);
    return;
  }
  if (!port) {
    console.warn('cant autofill as no connection to page is available');
    return;
  }

  // send the credentials to the page
  port.postMessage({
    type: 'autofill',
    credentials: credentials[0],
  });

  // now auto-close the popup
  setTimeout(window.close, 50);
});

function flushSessionUi() {
  return browser.storage.sync.get()
    .then((state) => {
      if (!state) {
        console.warn('no sync storage available');
        return;
      }
      console.log('state from storage', state);
      // update the ui with this data
      window.emit('view-model', state);
      return state;
    });
}

const Api = {
  'password-fields'(message) {
    var isLoginPage = message.fieldCount > 0;
    var pageSummary = 'No log-in form detected.';
    if (isLoginPage) {
      pageSummary = `login page for ${message.site}`;
    }
    window.emit('view-model', { pageSummary, isLoginPage });
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
      lastPasswords = result.relevant;
      window.emit('view-model', { 
        passwords: lastPasswords,
      });
    })
    .catch((err) => {
      console.error('unable to get passwords', err.message);
    })
    .finally(() => {
      // no longer scanning
      window.emit('view-model', { 
        isScanningPage: false,
      });
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

document.addEventListener('new-password-entered', (viewModel) => {
  const { site } = viewModel;
  const usernameElem = document.getElementById('username');
  const passwordElem = document.getElementById('password');
  const nameElem = document.getElementById('name');
  const name = nameElem.value;
  if (name.length === '') {
    name = 'default';
  }
  console.log('add password', site, usernameElem.value, passwordElem.value);
  return fetch('https://us-central1-dragoon-passman.cloudfunctions.net/password_fetch', {
    method: 'post',
    body: JSON.stringify({ site, name, username: usernameElem.value, password: passwordElem.value }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': viewModel.network + ' ' + viewModel.access_token,
    }
  })
  .then(() => {
    // clear out fields
    usernameElem.value = '';
    passwordElem.value = '';
    nameElem.value = '';
    // TODO: refresh password list
  })
  .catch (err => {
    // show error
    window.emit('view-model', { error: err.message });
  });
});

// ACK (3)
// on-load build a connection to the content script
browser.runtime.onConnect.addListener((e) => {
  console.log('received connection from page ' + JSON.stringify(e));

  // remember socket connection
  port = e;
  port.onMessage.addListener(onMessageReceived);

  // now use the content script to determine if this page is a login page
  window.emit('view-model', { isScanningPage: true });
  port.postMessage({
    type: 'check-for-password-fields' 
  });
});

// SYN (1)
// NOTE: detail is not accessible from page, so you can't put anything useful
// in here anyway (otherwise you get an 'access denied error')
browser.tabs.executeScript({
  code: `document.dispatchEvent(new CustomEvent('extension-installed', { detail: { } }));`,
});