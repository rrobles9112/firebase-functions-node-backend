const functions = require('firebase-functions');
const app = require('./app');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
 exports.backend = functions.https.onRequest(app);
