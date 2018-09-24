const admin = require('firebase-admin');
const functions = require('firebase-functions');
const moment = require('moment');

// configure and access firestore
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

const getUserDocument = userInfo => db.collection('users').doc(`${userInfo.provider}-${userInfo.userId}`);

const FirebaseStorageApi = {
  /**
   * Verify the user is configured and set-up in our backend
   * @param {*} userInfo the user's info (needs provider and userId)
   * @returns {Promise} when done
   */
  ensureUserExists(userInfo) {
    const docRef = getUserDocument(userInfo);
    return docRef.get()
      .then((snapshot) => {
        if (!snapshot.exists) {
          return false; // not found
        }
        return true; // found user
      })
      .then((isFound) => {
        if (isFound) {
          return Promise.resolve(); // nothing to do
        }
        // create boilerplate user document
        const now = moment();
        return docRef.set({
          createdAt: now.toDate(),
          subscription: {
            paid: false,
            expiresAt: now.add('48', 'hour').toDate(),
          },
        }, {
          merge: true,
        });
      });
  },

  /**
   * Get passwords relevant to the site being requested
   * @param {*} userAuth the calling user info
   * @param {string} siteRequested the host of the site these are being requested from
   * @returns {Promise<*>} callback with passwords
   */
  getPasswords(userAuth, siteRequested) {
    return getUserDocument(userAuth)
      .get()
      .then(snapshot => snapshot.data()
        .passwords
        .filter(p => p.host.toUpperCase() === siteRequested.toUpperCase()));
  },

  /**
   * Return the subscription
   * @param {*} userInfo the user's info
   */
  getSubscription(userInfo) {
    return getUserDocument(userInfo).get()
      .then((snapshot) => {
        const data = snapshot.data();
        if (!data) {
          throw new Error('user not found');
        }
        return data.subscription;
      });
  },

  /**
   * Saves a new password record
   * @param {*} record the record to save
   * @param {*} userInfo the user's info record
   * @returns {Promise} callback
   */
  saveNewPassword(record, userInfo) {
    if (!record || !record.host || !record.name) {
      return Promise.reject(new Error('Record was not valid'));
    }
    // TODO: check it doesn't exist first
    return getUserDocument(userInfo).set({
      passwords: {
        [record.host]: {
          [record.name]: {
            lastSet: new Date(),
            record,
          },
        },
      },
    }, {
      merge: true,
    });
  },
};

module.exports = FirebaseStorageApi;
