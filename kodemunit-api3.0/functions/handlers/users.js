const { db } = require("../util/admin");

const firebase = require("firebase");

const config = require("../util/config");

firebase.initializeApp(config);

exports.register = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    locaTion: req.body.locaTion,
    compAccess: req.body.compAccess,
    goodTime: req.body.goodTime,
    hoursWeek: req.body.hoursWeek,
    learningStyle: req.body.learningStyle,
    about: req.body.about
  };

  let userId;
  return firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      userId = data.user.uid;
      const userCredentials = {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        locaTion: newUser.locaTion,
        about: newUser.about,
        compAccess: newUser.compAccess,
        hoursWeek: newUser.hoursWeek,
        goodTime: newUser.goodTime,
        learningStyle: newUser.learningStyle,
        createdAt: new Date().toISOString(),
        userId
      };
      return db
        .collection(`/users`)
        .doc(`${userId}`)
        .set(userCredentials);
    })
    .then(() => {
      return res
        .status(201)
        .json({ success: "Successful registerd to kodemunit,  we'll get intouch with you ASAP" });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res
          .status(400)
          .json({ error: "Email Address is already registered" });
      } else {
        return res
          .status(500)
          .json({ error: "Something went wrong, please try again" });
      }
    });
};
