var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var moment = require('moment');
var multer = require('multer');
var router = express.Router();
var connection = require('./connection.js');
var mailer = require('./mailer.js');
var jwt    = require('jsonwebtoken');
var common = require('./common.js');

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
  verifyRecaptcha(req.body["recaptcha"], function(success) {
    if (success) {
      delete req.body["recaptcha"];
      delete req.body["member_confirm_password"];
    	req.body['ip_added'] = req.connection.remoteAddress.replace(/^.*:/, '');
    	req.body['last_login_ip'] = req.connection.remoteAddress.replace(/^.*:/, '');
    	req.body['member_password'] = common.encrypt(req.body['member_password']);
    	connection.query('SELECT * FROM cs_members where member_active_email=?',req.body['member_active_email'],
    		function(err, rows) {
    	  		if (err) {
              throw err;
            }
    	  		else if(rows.length>0){
    	  			res.status(303).json({'message': 'User with this emailId already exists','code': 'User Exists'});
    	  		}else{
              var tokenData = {
                  emailId: req.body.member_active_email
              };
              var token = jwt.sign(tokenData, privateKey);
              req.body['accessToken'] = token;
    	  			connection.query("INSERT INTO `cs_members` SET ?",req.body,function (err, results) {
    				   if (err) {
    				   	res.status(303).json({'message': err.message.split(":")[1],'code': err.code});
    				   }else{
                sendConfirmationEmail(req.body,results.insertId);
                req.session.accessToken = token;
                connection.query('SELECT * FROM cs_members where member_id=?',results.insertId,function(err1,resp1){
                  res.status(200).json({'user':resp1});
                });
    		  	   }
    				});
    	  		}
    		});
    }else{
      res.status(303).json({'message': 'Captcha failed, sorry.','code': 'Captcha Failed'});
    }
  });
});

app.put('/activeUser',function(req,res){
  connection.query('UPDATE cs_members SET ? WHERE ?', [{ is_email_active: 1 }, { member_id: req.body["userId"] }],function(err , result){
     if (err) {
      res.status(303).json({'message': err.message.split(":")[1],'code': err.code});
     }else{
      res.status(200).json({'affectedRows':result.changedRows});
     }
  });
});

app.post('/loginUser',function(req,res){
//connection.query("SELECT * FROM cs_members where member_active_email=" :Email and member_password= :Pwd",{Email: req.body['username'], Pwd: md5(req.body['password'])},
  connection.query("SELECT * FROM cs_members where member_active_email='"+req.body['username']+ "' and member_password='"+ common.encrypt(req.body['password']) +"'",{},
    function(err, user) {
        if(user && user.length>0){
          var tokenData = {
            emailId: user.member_active_email
          };
          var token = jwt.sign(tokenData, privateKey);
          req.session.accessToken = token;
          res.status(200).json({'user' : user , 'token': token});
        }else{
          res.status(401).json({'message': 'Username or Password is incorrect' ,'code': 'Invalid Credentials'});
        }
    })
});


app.get('/logoutUser',function(req,res){
  req.session.destroy();
  res.status(200).json({'message': 'Successfully Logout' ,'code': 'Success Logout'});;
});

app.post('/resetPassword',function(req,res){
  connection.query("SELECT * FROM cs_members where member_active_email='"+req.body['emailId']+"'",{},
    function(err, user) {
        if(user && user.length>0){
          sendResetPasswordMail(user[0]);
          res.status(200).json({'message' : 'Mail sent Successfully' , 'code' : 'SUCCESS'});
        }else{
          res.status(401).json({'message': 'Email address or username does not exist.' ,'code': 'Invalid EmailID'});
        }
    })
})

app.put('/updateUser',function(req,res){
  connection.query('UPDATE cs_members SET ? WHERE ?', [req.body['userdata'], { member_id: req.body["userdata"]["member_id"] }],function(err , result){
     if (err) {
      connection.query('SELECT * FROM cs_members where member_id=?',req.body["userdata"]["member_id"],function(err1,resp1){
      });
      res.status(303).json({'message': err.message.split(":")[1],'code': err.code});
     }else{
        res.status(200).json({'message': 'User updated successfully.','code': 'Updated'});
     }
  });
})


app.get('/getCertificateDetails',function(req,res){
  connection.query("SELECT * FROM cs_certificate where id_added=?" , [req.query.member_id] ,
      function(err, certdata) {
          if(certdata && certdata.length>0){
            res.status(200).json({'certificate' : certdata });
          }else{
            res.status(401).json({'message': 'Oops! Something went wrong!!' ,'code': 'Invalid Details'});
          }
      })
});

app.get('/getCertificateById',function(req,res){
  connection.query("SELECT * FROM cs_certificate where certificate_id=?" , [req.query.certificate_id] ,
      function(err, certdata) {
          if(certdata && certdata.length>0){
            res.status(200).json({'certificate' : certdata });
          }else{
            res.status(401).json({'message': 'Oops! Something went wrong!!' ,'code': 'Invalid Details'});
          }
      })
});

app.post('/createCertificate',function(req, res){
  req.body.date_added=moment().format('YYYY-MM-DD');
  req.body.ip_added = req.connection.remoteAddress.replace(/^.*:/, '');
  connection.query('SELECT * FROM cs_certificate where certificate_name=?',req.body['certificate_name'],
        function(err, rows) {
            if (err) {
              throw err;
            }
            else if(rows.length>0){
              res.status(303).json({'message': 'Program name already exists. Please enter different certificate name.','code': 'Duplicate Entry'});
            } else {
              connection.query("INSERT INTO `cs_certificate` SET ?",req.body,function (err, results) {
                 if (err) {
                  res.status(303).json({'message': err.message.split(":")[1],'code': err.code});
                 }else{
                  res.status(200).json({'message': 'Certificate created Successfully' ,'code': 'SUCCESS'});
                 }
              });
            }
        });
 });

app.put('/updateCertificate',function(req, res){
  req.body.date_edited=moment().format('YYYY-MM-DD');
  req.body.ip_edited = req.connection.remoteAddress.replace(/^.*:/, '');
  connection.query("Update `cs_certificate` SET ? WHERE ?",[ req.body , { certificate_id : req.body.certificate_id }],function (err, results) {
     if (err) {
      res.status(303).json({'message': err.message.split(":")[1],'code': err.code});
     }else{
      if(results.affectedRows)
        res.status(200).json({'message': 'Certificate updated Successfully' ,'code': 'SUCCESS'});
     }
  });
});

app.delete('/deleteCertificateById',function(req,res){
    console.log(req.query.certificate_id);
    connection.query("Delete FROM cs_certificate where certificate_id =?",req.query.certificate_id,function (err, results) {
      if (err) {
        res.status(303).json({'message': err.message.split(":")[1],'code': err.code});
      }else{
        if(results.affectedRows)
          res.status(200).json({'message': 'Certificate deleted Successfully' ,'code': 'SUCCESS'});
      }
    });
  })

/** File Upload coding **/

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './src/uploads/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.originalname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});

var upload = multer({ //multer settings
    storage: storage
  }).single('file');


/** API path that will upload the files */
app.post('/upload', function(req, res) {
  upload(req,res,function(err){
    if(err){
      res.status(200).json({'message': err.message ,'code': 'FAIL'});
    }else{
      res.status(200).json({'message':'File Uploaded Successfully','code': 'SUCCESS','filename': req.file.filename});
    }

  });
});


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