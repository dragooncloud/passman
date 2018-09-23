document.addEventListener('stepped', function(e) {
  if (e.detail.stepName !== 'start') {
    return;
  }

  // attach login providers to hello.js
	$('.btn-logon').on('click', function(event) {
		event.preventDefault();
		var target = $(this);
		var provider = target.data('auth');
		if (!provider) {
			console.error('misconfigured button thought it was a log-in button', this.outerHTML);
			return;
		}
		hello(provider).login();
  });

  // when user has logged in
	hello.on('auth.login', function(auth) {
		hello(auth.network).api('me')
			.then(function(me) {
        document.dispatchEvent(
          new CustomEvent('context-update', {
          detail: { user: me, auth },
        }));
				return fetch('https://us-central1-dragoon-passman.cloudfunctions.net/user_logged_in', {
					method: 'post',
					headers: {
						'Authorization': auth.network + ' ' + auth.authResponse.access_token,
					}
				});
      })
      .then(() => proceedToStep('certificate')
    );
  });
});