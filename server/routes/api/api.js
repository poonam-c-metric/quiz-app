var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var router = express.Router();
var connection = require('../connection.js');
var mailer = require('../mailer.js');
var jwt    = require('jsonwebtoken');
var common = require('../common.js');

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

function registerUser(req,res){
  delete req.body["member_confirm_password"];
  
  if(req.body['member_active_email'] && req.body['member_active_email'].length > 0 && req.body['member_password'] && req.body['member_password'].length > 0
     && req.body['member_first_name'] && req.body['member_first_name'].length > 0 && req.body['member_last_name'] && req.body['member_last_name'].length > 0)
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
app.post('/activeUser',function(req,res){
  if(req.body['userId'] && req.body['userId'].length > 0)
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

app.post('/loginUser',function(req,res){
if(req.body['username'] && req.body['username'].length > 0 && req.body['password'] && req.body['password'].length > 0)
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


app.get('/logoutUser',function(req,res){
  req.session.destroy();
  res.status(200).json({'status':1,'message': 'Successfully Logout' ,'code': 'Success Logout'});;
});

app.post('/resetPassword',function(req,res){
  if(req.body['emailId'] && req.body['emailId'].length > 0)
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

app.post('/updateUser',function(req,res){
  if(req.body['userdata']['member_active_email'] && req.body['userdata']['member_active_email'].length > 0 
     && req.body['userdata']['member_first_name'] && req.body['userdata']['member_first_name'].length > 0 && req.body['userdata']['member_last_name'] && req.body['userdata']['member_last_name'].length > 0)
  {
    connection.query('UPDATE cs_members SET ? WHERE ?', [req.body['userdata'], { member_id: req.body["userdata"]["member_id"] }],function(err , result){
       if (err) {
        connection.query('SELECT * FROM cs_members where member_id=?',req.body["userdata"]["member_id"],function(err1,resp1){
        });
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


function sendResetPasswordMail(user){
  var FROM_ADDRESS = 'support@Certspring.com';
  var TO_ADDRESS = user.member_active_email;
  var SUBJECT = 'Reset Password Link';

  var html =  "This email has been sent as a request to reset our password<br>" +
  "<a href='http://localhost:3000/#/resetPassword?accessToken='"+user.accessToken+"'>Click here</a>"+
  "if you want to reset your password, if not, then ignore"
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

module.exports = app;