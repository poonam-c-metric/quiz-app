var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var moment = require('moment');
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

/*Student insert*/

app.post('/createStudent',function(req, res){
  
    
      delete req.body["student_confirm_password"];
       if(req.body['student_first_name'] && req.body['student_first_name'].length > 0 && req.body['student_last_name'] && req.body['student_last_name'].length > 0
         && req.body['student_active_email'] && req.body['student_active_email'].length > 0 && req.body['student_password'] && req.body['student_password'].length > 0)
      {
        req.body['student_password'] = common.encrypt(req.body['student_password']);
        req.body.date_added=moment().format('YYYY-MM-DD');
        req.body.ip_added = req.connection.remoteAddress.replace(/^.*:/, '');
        connection.query('SELECT * FROM cs_students where student_active_email=?',req.body['student_active_email'],
          function(err, rows) {
              if (err) {
                throw err;
              }
              else if(rows.length>0){
                res.status(303).json({"status":0,'message': 'Student already present in current certificate programme','code': 'Student Exists'});
              }else{
                connection.query("INSERT INTO `cs_students` SET ?",req.body,function (err, results) {
                   if (err) {
                    console.log(err.message);
                    res.status(303).json({"status":0,'message': err.message.split(":")[1],'code': err.code});
                   }else{
                      if (req.body["is_email_active"] == true)
                      {
                        req.body['student_password'] = common.decrypt(req.body['student_password']);
                        var tokenData = {
                            emailId: req.body.member_active_email
                        };
                        var token = jwt.sign(tokenData, privateKey);
                        req.body['accessToken'] = token;
                        sendStudentConfirmationEmail(req.body,results.insertId);
                      }
                    res.status(200).json({"status":1,'message': 'Student created Successfully' ,'code': 'SUCCESS'});
                   }
                });
              }
          });
     }
    else
    {
      res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
    }
 
});


 app.post('/getStudentDetails',function(req,res){
  if(req.body['member_id'] && req.body['member_id'].length > 0)
  {
  connection.query("SELECT * FROM cs_students where id_added=?" , [req.body.member_id] ,
      function(err, studata) {
          if(studata && studata.length>0){
            res.status(200).json({"status":1,'message':'student details','student' : studata });
          }else{
            res.status(401).json({"status":0,'message': 'Oops! Something went wrong!!' ,'code': 'Invalid Details'});
          }
      })
  }
  else
  {
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});

app.post('/getStudentById',function(req,res){
  if(req.body['student_id'] && req.body['student_id'].length > 0)
  {
  connection.query("SELECT * FROM cs_students where student_id=?" , [req.body.student_id] ,
      function(err, studata) {
        
          if(studata && studata.length>0){
            studata[0].student_password = common.decrypt(studata[0].student_password);
            res.status(200).json({"status":1,'message':'','student data' : studata });
          }else{
            res.status(401).json({"status":0,'message': 'Oops! Something went wrong!!' ,'code': 'Invalid Details'});
          }
      })
  }
  else
  {
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});
app.post('/updateStudent',function(req, res){
  delete req.body["student_confirm_password"];
  //delete req.body["is_email_active"];
  //console.log(req.body);
   if(req.body['student_id'] && req.body['student_id'].length > 0 && req.body['student_first_name'] && req.body['student_first_name'].length > 0 && req.body['student_last_name'] && req.body['student_last_name'].length > 0
         && req.body['student_active_email'] && req.body['student_active_email'].length > 0 && req.body['student_password'] && req.body['student_password'].length > 0)
   {
    req.body['student_password'] = common.encrypt(req.body['student_password']);
    connection.query("Update `cs_students` SET ? WHERE ?",[ req.body , { student_id : req.body.student_id }],function (err, results) {
       if (err) {
        console.log(err.message);
        res.status(303).json({"status":0,'message': err.message.split(":")[1],'code': err.code});
       }else{
        if(results.affectedRows)
          {
             if (req.body["is_email_active"] == true)
              {
                req.body['student_password'] = common.decrypt(req.body['student_password']);
                var tokenData = {
                    emailId: req.body.member_active_email
                };
                var token = jwt.sign(tokenData, privateKey);
                req.body['accessToken'] = token;
                sendStudentConfirmationEmail(req.body,req.body["student_id"]);
              }
            res.status(200).json({"status":1,'message': 'Student updated Successfully' ,'code': 'SUCCESS'});
          }
       }
    });
    }
    else
    {
      res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
    }
});
app.post('/deleteStudent',function(req,res){
  if(req.body['student_id'] && req.body['student_id'].length > 0)
  {
  connection.query("Delete from cs_students where student_id=?" , [req.post.student_id] ,
      function(err, results) {
          if(err){
            res.status(401).json({"status":0,'message': 'Oops! Something went wrong!!' ,'code': 'Invalid Details'});
          }else{
            res.status(200).json({"status":1,'message': 'Student deleted Successfully' ,'code': 'SUCCESS'});
            
          }
      })
    }
    else
    {
      res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
    }
});

function sendStudentConfirmationEmail(req,userid){
  var FROM_ADDRESS = 'support@Certspring.com';
  var TO_ADDRESS = req.student_active_email;
  var SUBJECT = ' Learning Program Information';

    // relative to views/ directory - don't include extension!
  var RELATIVE_TEMPLATE_PATH = 'templates/confirm-email/index';

  var html =  "<h1>Dear "+ req.student_first_name + " "+ req.student_last_name +",</h1><br><br>" +
  "You have been registered for a Micro-Learning course by testorg..<br><br>"+
  "Login :"+
  "<a href='http://localhost:3000/#/online-exam?accessToken="+req.accessToken+"'>http://localhost:3000/#/online-exam?&accessToken="+req.accessToken+"</a><br><br>"+
  "<b>Email</b> :"+req.student_active_email+
  "<br><b>Passwors</b> :"+req.student_password+
  "<br><br>Best regards,<br>" +
  "The Certspring Team<br>" +
  "support@Certspring.com";
  
  console.log(html);

  mailer.sendMail(FROM_ADDRESS, TO_ADDRESS, SUBJECT, html, function(err, success){
    if(err){
      console.log(err);
      throw new Error('Problem sending email to: ' + TO_ADDRESS);
    }
    // Yay! Email was sent, now either do some more stuff or send a response back to the client
    res.send('Email sent: ' + success);
  });
}
/*End student*/

module.exports = app;