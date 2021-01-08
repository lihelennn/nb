const express = require('express');
const User = require('../models').User;
const router = express.Router();
const transporter = require('../email-config');
const { v4: uuidv4 } = require('uuid');

/**
 * Get active user
 * @name GET/api/users/current
 */
router.get('/current', (req, res) => {
  if (!req.session.userId){
    res.status(200).json(null);
    return null;
  }
  User.findByPk(req.session.userId,{attributes: ['id', 'username', 'name', 'email']}).then((user) => {
    res.status(200).json(user);
  });
});

/**
 * Get active user based on the id given in the request
 * @name POST/api/users/getuser
 */
router.post('/getuser', (req, res) => {
  if (!req.body.id) {
    res.status(200).json(null);
    return null;
  } 
  User.findOne({ where: { reset_password_id: req.body.id }}).then(function (user) {
    if (!user) {
      res.status(200).json(null);
      return null;
    } else {
      req.session.userId = user.id;
      res.status(200).json(user);
    }
  });
})

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
    console.log("error:" + err);
    res.status(400).json({msg: "Error registering"})
  })
});

router.post('/forgotpassword', (req, res) => {
  var reset_password_id = uuidv4();
  var link = req.headers.origin + "/#/forgotpassword?id=" + reset_password_id;

  User.findOne({ where: { email: req.body.email }}).then(function (user) {
    if (!user) {
      res.status(401).json({msg: "No user with email " + req.body.email});
    } else {
      user.update({
        reset_password_id: reset_password_id
      })
      var mailOptions = {
        from: 'nbv2.mailer@gmail.com',
        to: req.body.email,
        subject: 'NB V2 - Forgot Your Password',
        text: 'Hello ' + user.username + '!\n\nYou indicated that you have forgotten your password for NB V2.' + 
        '\n\nPlease click on this link to reset your password: \n' + link + 
        '\n\nIf you believe that this is a mistake, please contact us or change your password on your user settings page.'
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          res.status(200).json({email: req.body.email});
        }
      });
    }
  });
});

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
        res.status(400).json({msg: "Username or email already taken. Please provide another one."})
      })
    }
  });
});

router.put('/editAuth', (req, res) => {
  // find the current user first
  if (!req.session.userId){
    res.status(200).json(null);
    return null;
  }
  User.findByPk(req.session.userId,{attributes: ['id', 'username', 'name']}).then((user) => {
    if (!user) {
      res.status(401).json({msg: "Cannot find user "})
    } else {
      user.update({
        password: req.body.newpassword,
        reset_password_id: null,
      }).then(() => {
        res.status(200).json({msg: "editted auth password"})
      }).catch((err) => {
    console.log("error:" + err);
        res.status(400).json({msg: "Error editting password"})
      })
    }
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ msg: "signed out" }).end();
});

module.exports = router;
