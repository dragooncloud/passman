var port = null;

const Api = {
  'password-fields': (message) => {
    var output = document.getElementById('popuptext');
    if (message.fieldCount === 0) {
      output.innerText = 'Not a login page';
      return;
    }
    output.innerText = `login page for ${message.site}`;
  },
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