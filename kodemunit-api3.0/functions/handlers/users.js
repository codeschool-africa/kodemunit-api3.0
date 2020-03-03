const { db } = require("../util/admin");

const firebase = require("firebase");

const config = require("../util/config");

firebase.initializeApp(config);

exports.register = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  };

  let dummy = "dummy.jpeg";
  let token, userId;
  db.doc(`/users/${newUser.email}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({
            error: "Email is already is registered",
            message: "Login or register with another email"
          });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      const userCredentials = {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${dummy}?alt=media`,
        userId
      };
      return db.doc(`/users/${newUser.email}`).set(userCredentials);
    })
    .then(() => {
      const user = firebase.auth().currentUser;
      user.sendEmailVerification().then(() => {
        return res.status(201).json({
          success: "Account was created successfully",
          message:
            "Verification link was sent to your email, please click the link to verify your account"
        });
      });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res
          .status(400)
          .json({ email: "Email is already is use, try another email" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};

exports.signin = (req, res) => {
  const User = {
    email: req.body.email,
    password: req.body.password
  };

  firebase
    .auth()
    .signInWithEmailAndPassword(User.email, User.password)
    .then(data => {
      if (data.user.emailVerified) {
        return data.user.getIdToken();
      } else {
        return res.status(403).json({
          error:
            "please verify your email by clicking the link sent to your email"
        });
      }
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      if ((err.code = "auth/user-not-found" || "auth/wrong-password"))
        return res
          .status(403)
          .json({ general: "Wrong credentials, please try again" });
      else return res.status(500).json({ error: err.code });
    });
};
