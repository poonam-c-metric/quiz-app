var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var router = express.Router();
var connection = require('../connection.js');
var mailer = require('../mailer.js');
var jwt    = require('jsonwebtoken');
var common = require('../common.js');
var moment = require('moment');
var https = require('https');

const app = express();

connection.connect();

var privateKey = 'c-metricsolution';
var SECRET = "6Le8ySAUAAAAANH9A_xJV0nDyyYZN0P54XyZRUWA";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.use(cookieParser());
app.use(session({secret: privateKey ,resave: true, saveUninitialized: true ,cookie: { secure: false }}));
app.use(router);

 app.use(function(req, res, next) { //allow cross origin requests
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
/*
  Author : Poonam Gokani
  Desc   : Register and login api
  Date   :29/5/2016
 */
app.post('/registerUser',function(req, res){
  if(req.body['deviceType']==0){
    verifyRecaptcha(req.body["recaptcha"], function(success) {
      if (success) {
        delete req.body["recaptcha"];
        registerUser(req,res)
      }else{
        res.status(303).json({'status':0,'message': 'Captcha failed, sorry.','code': 'Captcha Failed'});
      }
    });
  }else{
    registerUser(req,res);
  }
});
/*Register user*/
function registerUser(req,res){
  delete req.body["member_confirm_password"];
  if(req.body['member_active_email'] && req.body['member_active_email'].trim() != '' && req.body['member_password'] && req.body['member_password'].trim() != ''
     && req.body['member_first_name'] && req.body['member_first_name'].trim() != '' && req.body['member_last_name'] && req.body['member_last_name'].trim() != '')
  {
    req.body['ip_added'] = req.connection.remoteAddress.replace(/^.*:/, '');
    req.body['last_login_ip'] = req.connection.remoteAddress.replace(/^.*:/, '');
    req.body['member_password'] = common.encrypt(req.body['member_password']);
    connection.query('SELECT * FROM cs_members where member_active_email=?',req.body['member_active_email'],
      function(err, rows) {
          if (err) {
            throw err;
          }
          else if(rows.length>0){
            res.status(303).json({'status':0,'message': 'User with this emailId already exists','code': 'User Exists'});
          }else{
            var tokenData = {
                emailId: req.body.member_active_email
            };
            var token = jwt.sign(tokenData, privateKey);
            req.body['accessToken'] = token;
            connection.query("INSERT INTO `cs_members` SET ?",req.body,function (err, results) {
             if (err) {
              res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
             }else{
              sendConfirmationEmail(req.body,results.insertId);
              req.session.accessToken = token;
              connection.query('SELECT * FROM cs_members where member_id=?',results.insertId,function(err1,resp1){
                res.status(200).json({'status':1,'message':'Register successfully.','user':resp1[0]});
              });
             }
          });
        }
      });
  }
  else
  {
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
}
/*Active user*/
app.post('/activeUser',function(req,res){
  if(req.body['userId'] && req.body['userId'].trim() != '')
  {
    connection.query('UPDATE cs_members SET ? WHERE ?', [{ is_email_active: 1 }, { member_id: req.body["userId"] }],function(err , result){
       if (err) {
        res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
       }else{
        res.status(200).json({'status':1,'message':'Activated successfully.','affectedRows':result.changedRows});
       }
    });
  }
  else
  {
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});
/*Login user*/
app.post('/loginUser',function(req,res){
if(req.body['username'] && req.body['username'].trim() != '' && req.body['password'] && req.body['password'].trim() != '')
{
  connection.query("SELECT * FROM cs_members where member_active_email='"+req.body['username']+ "' and member_password='"+ common.encrypt(req.body['password']) +"'",{},
    function(err, user) {
        if(user && user.length>0){
          var tokenData = {
            emailId: user.member_active_email
          };
          var token = jwt.sign(tokenData, privateKey);
          req.session.accessToken = token;
          res.status(200).json({'status':1, 'message':"Login successfully",'user' : user[0] }); //, 'token': token
        }else{
          res.status(401).json({'status':0,'message': 'Username or Password is incorrect' ,'code': 'Invalid Credentials'});
        }
    })
}
else
{
  res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
}
});

/*Logout user*/
app.get('/logoutUser',function(req,res){
  req.session.destroy();
  res.status(200).json({'status':1,'message': 'Successfully Logout' ,'code': 'Success Logout'});;
});
/*
  Author : Niral Patel
  Desc   : Rest password
  Date   :1/6/2016
 */
app.post('/resetPassword',function(req,res){
  if(req.body['emailId'] && req.body['emailId'].trim() != '')
  {
  connection.query("SELECT * FROM cs_members where member_active_email='"+req.body['emailId']+"'",{},
    function(err, user) {
        if(user && user.length>0){
          sendResetPasswordMail(user[0]);
          res.status(200).json({'status':1,'message' : 'Mail sent Successfully' , 'code' : 'SUCCESS'});
        }else{
          res.status(401).json({'status':1,'message': 'Email address or username does not exist.' ,'code': 'Invalid EmailID'});
        }
    })
  }
  else
  {
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
})
/*
  Author : Poonam Gokani
  Desc   : Update user
  Date   :29/5/2016
 */

app.post('/updateUser', IsAuthenticated, function(req,res){

  if(req.body['userdata']['member_active_email'] && req.body['userdata']['member_active_email'].trim() != ''
     && req.body['userdata']['member_first_name'] && req.body['userdata']['member_first_name'].trim() != '' && req.body['userdata']['member_last_name'] && req.body['userdata']['member_last_name'].trim() != '')
  {
    connection.query('UPDATE cs_members SET ? WHERE ?', [req.body['userdata'], { member_id: req.body["userdata"]["member_id"] }],function(err , result){
       if (err) {
        res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
       }else{
          res.status(200).json({'status':1,'message': 'User updated successfully.','code': 'Updated'});
       }
    });
  }
  else
  {
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
})

/*
  Author : Niral Patel
  Desc   : update reset password
  Date   :1/6/2016
 */
app.post('/updateResetPassword',function(req,res){
  if(req.body['accessToken'] && req.body['accessToken'].trim() != '' && req.body['member_password'] && req.body['member_password'].trim() != '')
  {
  req.body['member_password'] = common.encrypt(req.body['member_password']);
  connection.query("SELECT * FROM cs_members where accessToken='"+req.body['accessToken']+"'",{},
    function(err, user) {
        if(user && user.length>0){
          connection.query('UPDATE cs_members SET ? WHERE ?', [{ member_password: req.body["member_password"] }, { accessToken: req.body["accessToken"] }],function(err , result){
             if (err) {
              res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
             }else{
              res.status(200).json({'status':1,'message' : 'Update password sucessfully and check mail in your email id.' , 'code' : 'SUCCESS'});
              sendUpdateResetPasswordMail(user[0]);
             }
          });
        }else{
          res.status(401).json({'status':0,'message': 'Invalid url' ,'code': 'Invalid url'});
        }
    })
  }
  else
  {
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
})

/*
  Author : Niral Patel
  Desc   : Change password
  Date   :1/6/2016
 */
app.post('/changePassword', IsAuthenticated, function(req,res){
  if(req.body['member_id'] && req.body['member_id'] != '' && req.body['member_old_password'] && req.body['member_old_password'].trim() != '' && req.body['member_password'] && req.body['member_password'].trim() != '')
  {
  req.body['member_password'] = common.encrypt(req.body['member_password']);
  req.body['member_old_password'] = common.encrypt(req.body['member_old_password']);
  connection.query("SELECT member_id,member_first_name,member_last_name,member_active_email,member_password FROM cs_members where member_id ='"+req.body['member_id']+"' and member_password='"+req.body['member_old_password']+"'",{},
    function(err, user) {
        if(user && user.length>0){
          connection.query('UPDATE cs_members SET ? WHERE ?', [{ member_password: req.body["member_password"] }, { member_id: req.body["member_id"] }],function(err , result){
             if (err) {
              res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
             }else{
              if(req.body['send_email'] && req.body['send_email'] == 1)
              {
                sendUpdateResetPasswordMail(user[0]);
              }

              res.status(200).json({'status':1,'message' : 'You account password has been changed successfully.' , 'code' : 'SUCCESS'});
             }
          });
        }else{
          res.status(401).json({'status':0,'message': 'Invalid old password' ,'code': 'Invalid old password'});
        }
    })
  }
  else
  {
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
})


// Helper function to make API call to recatpcha and check response
function verifyRecaptcha(key, callback) {
  https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET + "&response=" + key, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk.toString();
    });
    res.on('end', function() {
      try {
        var parsedData = JSON.parse(data);
        callback(parsedData.success);
      } catch (e) {
        callback(false);
      }
    });
  });
}
/*
  Author : Poonam Gokani
  Desc   : send confirmatiom
  Date   :29/5/2016
 */

function sendConfirmationEmail(req,userid){
  var FROM_ADDRESS = 'support@Certspring.com';
  var TO_ADDRESS = req.member_active_email;
  var SUBJECT = 'Registration Information';

    // relative to views/ directory - don't include extension!
  var RELATIVE_TEMPLATE_PATH = 'templates/confirm-email/index';

  var html =  "<h1>Dear "+ req.member_first_name + " "+ req.member_last_name +",</h1><br><br>" +
  "Thank you for registering with Certspring.<br><br>"+
  "In order to verify this email address and activate your account, please click here:<br><br>"+
  "<a href='http://localhost:3000/#/active?userId="+userid+"&accessToken="+req.accessToken+"'>http://localhost:3000/#/active?userId="+userid+"&accessToken="+req.accessToken+"</a><br><br>"
  "Best regards,<br>" +
  "The Certspring Team<br>" +
  "support@Certspring.com";



  mailer.sendMail(FROM_ADDRESS, TO_ADDRESS, SUBJECT, html, function(err, success){
    if(err){
      throw new Error('Problem sending email to: ' + TO_ADDRESS);
    }
    // Yay! Email was sent, now either do some more stuff or send a response back to the client
    res.send('Email sent: ' + success);
  });
}
/*
  Author : Niral Patel
  Desc   : Send reset password mail
  Date   :1/6/2016
 */

function sendResetPasswordMail(user){

  var FROM_ADDRESS = 'support@Certspring.com';
  var TO_ADDRESS = user.member_active_email;
  var SUBJECT = 'Reset Password Link';

  var html =  "This email has been sent as a request to reset our password<br><br>" +
  "<a href='http://localhost:3000/#/resetPassword?accessToken="+user.accessToken+"'>Click here </a>"+
  "if you want to reset your password, if not, then ignore<br><br>"+
  "Best regards,<br>The Certspring Team<br>" +
  "support@Certspring.com";

  mailer.sendMail(FROM_ADDRESS, TO_ADDRESS, SUBJECT, html, function(err, success){
    if(err){
      throw new Error('Problem sending email to: ' + TO_ADDRESS);
    }
    // Yay! Email was sent, now either do some more stuff or send a response back to the client
    res.send('Email sent: ' + success);
  });
}
/*
  Author : Niral Patel
  Desc   : send updated forgotpassword
  Date   :1/6/2016
 */

function sendUpdateResetPasswordMail(user){

  var FROM_ADDRESS = 'support@Certspring.com';
  var TO_ADDRESS = user.member_active_email;
  var SUBJECT = 'Certspring teacher account password changed';
  var DATE =moment().format('MMM/DD/YYYY');
  var html =  "Dear "+user.member_first_name+" "+user.member_last_name+",<br><br>" +
  "Please note that a password has been changed, as per your request on "+DATE+"<br><br>"+
  "Username: "+user.member_active_email+" <br>"+
  "Password: "+common.decrypt(user.member_password)+"<br><br>"+
  "Best regards,<br>The Certspring Team<br>" +
  "support@Certspring.com";

  mailer.sendMail(FROM_ADDRESS, TO_ADDRESS, SUBJECT, html, function(err, success){
    if(err){
      throw new Error('Problem sending email to: ' + TO_ADDRESS);
    }
    // Yay! Email was sent, now either do some more stuff or send a response back to the client
    res.send('Email sent: ' + success);
  });
}

module.exports = app;