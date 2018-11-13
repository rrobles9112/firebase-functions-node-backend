const express = require('express');
const cors = require('cors');
const methodOverride = require('method-override');


const admin = require('firebase-admin');
const firebase = require('firebase');
const config = {
    apiKey: "AIzaSyCkKPmsGxC2ihS-4g0C1qksrYgtqsgsjuc",
    authDomain: "eshop-back.firebaseapp.com",
    databaseURL: "https://eshop-back.firebaseio.com",
    projectId: "eshop-back",
    storageBucket: "eshop-back.appspot.com",
    messagingSenderId: "672704932432"
};
firebase.initializeApp(config);

const serviceAccount = require("./credential/eshop-back-firebase-adminsdk-78ctw-a1be8c4d3b");

admin.initializeApp({

    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://eshop-back.firebaseio.com"

});
const settings = {timestampsInSnapshots:true};
const getFirestore = admin.firestore();
getFirestore.settings(settings);

const app = express();
// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.

const authenticate = async (req, res, next) => {

    

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {

      res.status(403).send('Unauthorized');
      return;
    }
    const idToken = req.headers.authorization.split('Bearer ')[1];
    console.log('idToken=',idToken);
    try {
      let decodedIdToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedIdToken;
      next();
      return;
    } catch(e) {
      res.status(403).send('Unauthorized');
      return;
    }  
  };
  

app.use(cors({origin:true}));
app.use(express.json())
app.use(methodOverride())

app.get('/',  async (req, res) => {
    const message = req.body.message;
    admin.auth().getUserByEmail('admin@admin.com')
        .then((userRecord) => {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully fetched user data:", userRecord.passwordSalt);
            return res.send(userRecord.toJSON());
        })
        .catch((error) => {
            console.log("Error fetching user data:", error);
            return res.status(404).send(error);
        });

});

app.post('/login',  (req, res) => {

    const username = req.body.username || null;
    const password = req.body.password || null;
    console.log(req.body, req.params)
    firebase.auth().signInWithEmailAndPassword(username,password).then((response)=>{
        return res.json(response);
    }).catch((error)=>{
        return res.status(404).json(error);
    })
   // return res.json({hello:'world', user:email,pass:password});

});


app.post('/logout',  (req, res) => {

    firebase.auth().signOut().then((response)=>{
        console.log()
        return res.json({success:true,message:'Logout successful'});
    }).catch((error)=>{
        return res.status(404).json(error);
    })
    // return res.json({hello:'world', user:email,pass:password});

});

app.get('/products', authenticate, async (req, res) => {

    let apiResponse = [];
    let item = {};
    const citiesRef = getFirestore.collection('products');

    const allCities = citiesRef.get()
        .then(snapshot => {

            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());

                item[doc.id]=doc.data;
                apiResponse = [...apiResponse,{id:doc.id,product:doc.data()}]
            });

            return res.status(201).json({success:true,data:apiResponse})
        })
        .catch(err => {
            console.log('Error getting documents', err);
            return res.status(404).json({success:false,error:err})
        });

});


module.exports = app;