const express = require('express');
const User = require('../models').User;
const router = express.Router();

/**
 * Set username of active user.
 * @name POST/api/users/signin
 */
router.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ where: { username: username } }).then(function (user) {
    if (!user) {
      res.status(401).json({msg: "No user with username " + username});
    } else if (!user.validPassword(password)) {
      res.status(401).json({msg: "Incorrect password"});
    } else {
      req.session.userId = user.id;
      res.status(200).json({msg: "logged in"});
    }
});
});

router.post('/register', (req, res) => {
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  }).then((user) => {
    res.status(200).json({msg: "registered"});
  }).catch((err)=>{
    console.log("error:" + err);
  });

})

/**
 * Set username of active user.
 * @name POST/api/users/signin
 */
router.post('/logout', (req, res) => {
  req.session.userId = "";
  res.status(200).json({ msg: "signed out" }).end();
});

module.exports = router;
