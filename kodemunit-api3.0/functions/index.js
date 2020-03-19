const functions = require("firebase-functions");
const FBAuth = require("./util/fbAuth");
const app = require("express")();

const cors = require("cors");
app.use(cors());

const { register } = require("./handlers/users");

//routes
//users routes
app.post("/signup", register);

exports.api = functions.https.onRequest(app);
