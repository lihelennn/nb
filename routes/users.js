const express = require('express');
const User = require('../models').User;
const router = express.Router();
var generator = require('generate-password');
const transporter = require('../email-config');

const { v4: uuidv4 } = require('uuid');

function sendVerificationMail(email, verification_id) {
  var link = "http://localhost:8080/#/verify?verification_id=" + verification_id
  var mailOptions = {
    from: 'helen.nbv2@gmail.com',
    to: email,
    subject: 'Please Verify Your NB V2 Account',
    // text: 'Hello there!' + 
    // '\n\nThank you for contacting us.' + 
    // '\n\nPlease verify this email (prferably within 24 hours) by clicking on this link: ' + 
    // '\n\nhttps://nb.edu/verify? ' + verification_id +
    // '\n\nPlease login again if you need to resend a verification link.' + 
    // '\n\nIf you believe that this is a mistake, please contact us at nb@mit.edu.',
    html: "Hello there!<br><br>Thank you for contacting us.<br><br>" +
    "Please verify this email (preferably within 24 hours) by clicking on this " +
    '<a href="' + link + '">link</a>.<br><br>'+
    'If you believe that this is a mistake, please contact us at nb@mit.edu<br><br>' +
    'Best,<br>NB V2 Team'
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({email: email});
    }
  });
}

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

router.post('/forgotpassword', (req, res) => {
  // create reusable transporter object using the default SMTP transport
    // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  var password = generator.generate({
    length: 20,
    numbers: true,
  });
  User.findOne({ where: { email: req.body.email }}).then(function (user) {
    if (!user) {
      res.status(401).json({msg: "No user with email " + req.body.email});
    } else {
      user.update({
        password: password
      })
      var mailOptions = {
        from: 'helen.nbv2@gmail.com',
        to: req.body.email,
        subject: 'NB V2 - Forgot Your Password',
        text: 'Hello!\n\nYou indicated that you have forgotten your password for NB V2.' + 
        '\n\nHere is your temporary password: \n' + password + 
        '\n\nBe sure to change your password to a secure password after recovering your account.' + 
        '\n\nIf you believe that this is a mistake, please contact us at nb@mit.edu or change your password on your user settings page.'
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
})

router.post('/register', (req, res) => {
  var verificationId = uuidv4();
  User.create({
    username: req.body.username,
    first_name: req.body.first,
    last_name: req.body.last,
    email: req.body.email,
    password: req.body.password,
    verification_id: verificationId,
    account_verified: false
  }).then(() => {
    var link = "http://localhost:8080/#/verify?verification_id=" + verificationId
    var mailOptions = {
      from: 'helen.nbv2@gmail.com',
      to: req.body.email,
      subject: 'NB V2 - Welcome',
      // text: 'Welcome to NB!' + 
      // '\n\nHere are some tutorial guidelines and links: ' + 
      // '\n\nPlease verify this email (prferably within 24 hours) by clicking on this link: ' + 
      // '\n\nhttps://nb.edu/verify? ' + verificationId +
      // '\n\nPlease login again if you need to resend a verification link.' + 
      // '\n\nIf you believe that this is a mistake, please contact us at nb@mit.edu.',
      html: "Welcome to NB V2!<br><br>Thank you for registering for an account.<br><br>" +
      "Here are some tutorial guidelines and links: <br><br>" +
      "Please verify this email (preferably within 24 hours) by clicking on this " +
      '<a href="' + link + '">link</a>.<br><br>'+
      'If you believe that this is a mistake, please contact us at nb@mit.edu<br><br>' +
      'Best,<br>NB V2 Team'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).json({email: req.body.email});
      }
    });
    res.status(200).json({msg: "registered"});
  }).catch((err)=>{
    console.log(err)
      res.status(400).json({msg: "cannot send registration activate account link error."})
  });
})

router.post('/resendVerification', (req, res) => {
  if (!req.session.userId){
    res.status(200).json(null);
    return null;
  }
  User.findByPk(req.session.userId,{attributes: ['id', 'username', 'name', 'email', 'verification_id']}).then((user) => {
    if (!user) {
      res.status(401).json({msg: "Cannot find user "})
    } else {
      var verificationId = uuidv4();
      if (user.verification_id == null) {
        user.update({
          verification_id: verificationId
        }).then(() => {
          sendVerificationMail(user.email, user.verification_id);
        }).catch((err) => {
          res.status(400).json({msg: "Error creating verification code."})
        })
      } else {
        sendVerificationMail(user.email, user.verification_id);
      }
      res.status(200).json({msg: "registered"});
    }
  })
})

router.put('/verify', (req, res) => {
  console.log(req.body);
  User.findOne({ where: { verification_id: req.body.verification_id }}).then(function (user) {
    if (!user) {
      res.status(401).json({msg: "No user found for this verification id"});
    } else {
      user.update({
        account_verified: true
      }).then(() => {
        console.log("done!");
        console.log(user);
        res.status(200).json({msg: "Account verified"})
      }).catch((err) => {
        res.status(400).json({msg: "Error verifying account"})
      })
    }
  })
})  

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
