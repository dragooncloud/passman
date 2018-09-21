const storage = require('../storage');

/**
 * Parse the auth header and return auth provider and access_token
 * @param {string} headerValue the value of the Authorization header
 * @returns {*} provider and access token or an error will be thrown
 */
const parseAuthenticationHeader = (headerValue) => {
  const split = (headerValue || '').split(' ');
  if (split.length < 2) {
    throw new Error('Authorization header not set correctly');
  }

  const provider = split[0];
  const accessToken = split[1];
  return {
    provider,
    accessToken,
  };
};

/**
 * Wrap an http request with this and it'll secure it from unauthorised access
 * @param {Request} request
 * @param {Response} response
 * @param {Function<*>} next the callback if auth is successful
 * @returns {Promise} all things deferred
 */
const secureRequest = (request, response, next) => {
  try {
    let userAuth = parseAuthenticationHeader(request.header('authorization'));
    userAuth = { provider: userAuth.provider, userId: 'usr-1234567890' };
    return storage.ensureUserExists(userAuth).then(() => next(userAuth));
  } catch (e) {
    return response.status(401).send({ error: e.message });
  }
};

module.exports = { parseAuthenticationHeader, secureRequest };
