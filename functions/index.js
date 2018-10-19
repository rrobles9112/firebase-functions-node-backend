const functions = require('firebase-functions');
const app = require('./app');

 exports.eshop = functions.https.onRequest(app);
