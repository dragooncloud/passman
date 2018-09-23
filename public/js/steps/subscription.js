document.addEventListener('stepped', (e) => {
  if (e.detail.stepName !== 'subscription') {
    return;
  }

  // get password subscription info from main server
  return fetch('https://us-central1-dragoon-passman.cloudfunctions.net/subscription', {
    method: 'get',
    headers: {
      'Authorization': `${e.detail.auth.network} ${e.detail.auth.authResponse.access_token}`,s
    }
  })
  .then(r => r.json())
  .then((subscription) => {
    // TODO: update ui
    // update context with subscription info
    document.dispatchEvent(new CustomEvent('context-update', { detail: { subscription } }));
  });
});