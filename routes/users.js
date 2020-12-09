const express = require('express');
const User = require('../models').User;
const router = express.Router();

/**
 * Get active user.
 * @name GET/api/users/current
 */
router.get('/current', (req, res) => {
  if (!req.session.userId){
    res.status(200).json(null);
    return null;
  }
  User.findByPk(req.session.userId,{attributes: ['id', 'username', 'name', 'email', 'verification_id', 'account_verified']}).then((user) => {
    res.status(200).json(user);
  });
});

/**
 * Get all users.
 * @name POST/api/users/all
 */
router.get('/all', (req, res) => {
  User.findAll({attributes:['id','username','name','email']}).then((users) => {
    res.status(200).json(users);
  });
});

/**
 * Set username of active user.
 * @name POST/api/users/signin
 */
router.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ where: { username: username }}).then(function (user) {
    if (!user) {
      res.status(401).json({msg: "No user with username " + username});
    } else if (!user.validPassword(password)) {
      res.status(401).json({msg: "Incorrect password"});
    } else {
      req.session.userId = user.id;
      res.status(200).json({username: user.username, id: user.id, name: user.name});
    }
  });
});

router.post('/register', (req, res) => {
  User.create({
    username: req.body.username,
    first_name: req.body.first,
    last_name: req.body.last,
    email: req.body.email,
    password: req.body.password
  }).then(() => {
    res.status(200).json({msg: "registered"});
  }).catch((err)=>{
router.put('/editPersonal', (req, res) => {
  // find the current user first
  if (!req.session.userId){
    res.status(200).json(null);
    return null;
  }
  User.findByPk(req.session.userId,{attributes: ['id', 'username', 'name']}).then((user) => {
    if (!user) {
      res.status(401).json({msg: "Cannot find user "})
    } else {
      console.log(req.body);
      user.update({
        first_name: req.body.first,
        last_name: req.body.last,
        email: req.body.email,
        username: req.body.username,
      }).then(() => {
        res.status(200).json({msg: "editted person information"})
      }).catch((err) => {
        console.log("error: " + err);
        res.status(400).json({msg: "Username already taken. Please provide another one."})
      })
    }
  });
})

router.put('/editAuth', (req, res) => {
  // find the current user first
  console.log(req.body)
  if (!req.session.userId){
    res.status(200).json(null);
    return null;
  }
  User.findByPk(req.session.userId,{attributes: ['id', 'username', 'name']}).then((user) => {
    if (!user) {
      res.status(401).json({msg: "Cannot find user "})
    } else {
      user.update({
        password: req.body.newpassword
      }).then(() => {
        res.status(200).json({msg: "editted auth password"})
      }).catch((err) => {
    console.log("error:" + err);
        res.status(400).json({msg: "Error editting password"})
      })
    }
  });
})

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ msg: "signed out" }).end();
});

module.exports = router;
