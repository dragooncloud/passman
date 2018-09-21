const functions = require('firebase-functions');

const cors = require('cors')({
  origin: true,
  allowedHeaders: ['Authorization'],
  credentials: true,
  methods: ['POST', 'GET', 'PUT'],
});

const auth = require('./auth');
const storage = require('./storage');

/**
 * User is logging in
 */
exports.user_logged_in = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    auth.secureRequest(request, response, (userAuth) => {
      response.status(200).send({ success: true, userAuth });
    });
  });
});

/**
 * Submit a password
 */
exports.password_submit = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    auth.secureRequest(request, response, (userAuth) => {
      // save password to storage layer
      storage
        .saveNewPassword(request.body, userAuth)
        .then(() => {
          response.status(200).send({ success: true, userAuth });
        })
        .catch((e) => {
          console.error('error submitting password record', e, userAuth);
          response.status(500).send({ error: e.message });
        });
    });
  });
});

/**
 * Fetch a password
 */
exports.password_fetch = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    auth.secureRequest(request, response, (userAuth) => {
      response.status(200).send({
        userAuth,
        relevant: [
          {
            name: 'default',
            username: 'foo',
            password: 'bar',
            host: 'github.com',
          },
          {
            name: 'default',
            username: 'foo2',
            password: 'bar321',
            host: 'stackoverflow.com',
          },
        ],
      });
    });
  });
});

/**
 * User chose a password (learn from this choice)
 */
exports.password_user_chosen = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    response.status(200).send({ success: true });
  });
});

/**
 * User chose a password (learn from this choice)
 */
exports.password_rename = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    response.status(200).send({ success: true, newName: 'newName12343' });
  });
});
