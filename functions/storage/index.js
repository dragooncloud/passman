const admin = require('firebase-admin');
const functions = require('firebase-functions');

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
    return getUserDocument(userInfo).set({
      lastActivity: new Date(),
    }, {
      merge: true,
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
