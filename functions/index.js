const functions = require('firebase-functions');
const app = require('./app');

exports.backend = functions.https.onRequest(app);
