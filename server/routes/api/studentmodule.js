/*
  Author : Poonam Gokani
  Desc   : All WebService Like StudentLogin , Forgot Student Password
  Date   : 19/07/2017
 */
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

/*
  Author : Poonam Gokani
  Desc   : Webservice for Student Login
  Date   : 19/07/2017
 */
app.post('/loginStudent',function(req,res){
  if(req.body['student_active_email'] && req.body['student_active_email'].trim() != '' && req.body['student_password'] && req.body['student_password'].trim() != ''){
    connection.query("SELECT * FROM cs_students where student_active_email='"+req.body['student_active_email']+ "' and student_password='"+ common.encrypt(req.body['student_password']) +"'",{},
      function(err, student) {
        if(student && student.length>0){
            req.session.studentAccessToken = student.accessToken;
            res.status(200).json({'status':1, 'message':"Login successfully",'student' : student[0] });
          }else{
            res.status(401).json({'status':0,'message': 'Username or Password is incorrect' ,'code': 'Invalid Credentials'});
          }
      })
  }else{
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});

/*
  Author : Poonam Gokani
  Desc   : Webservice for Student Logout
  Date   : 21/07/2017
 */
app.post('/logoutStudent',function(req,res){
  delete req.session.studentAccessToken;
  res.status(200).json({'status':1,'message': 'Successfully Logout' ,'code': 'Success Logout'});
});

/*
  Author : Poonam Gokani
  Desc   : Webservice for Student Change password
  Date   : 24/07/2017
 */
app.post('/changeStudentPassword', function(req,res){
  if(req.body['student_id'] && req.body['student_id'] != '' && req.body['student_old_password'] && req.body['student_old_password'].trim() != '' && req.body['student_password'] && req.body['student_password'].trim() != ''){
    req.body['student_password'] = common.encrypt(req.body['student_password']);
    req.body['student_old_password'] = common.encrypt(req.body['student_old_password']);
    connection.query("SELECT student_id,student_first_name,student_last_name,student_active_email,student_password FROM cs_students where student_id ='"+req.body['student_id']+"' and student_password='"+req.body['student_old_password']+"'",{},
      function(err, student) {
          if(student && student.length>0){
            connection.query('UPDATE cs_students SET ? WHERE ?', [{ student_password: req.body["student_password"] }, { student_id: req.body["student_id"] }],function(err , result){
              if (err) {
                res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
              }else{
                console.log('send_email flag:'+req.body['send_email']);
                if(req.body['send_email'] && req.body['send_email'] == 1)
                {
                  sendUpdateResetPasswordMail(student[0]);
                }
                res.status(200).json({'status':1,'message' : 'You account password has been changed successfully.' , 'code' : 'SUCCESS'});
              }
            });
          }else{
            res.status(200).json({'status':0,'message': 'Invalid old password' ,'code': 'Invalid old password'});
          }
      })
  }
  else
  {
    res.status(200).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
})

/*
  Author : Poonam Gokani
  Desc   : Webservice for save student answer
  Date   : 26/07/2017
 */
app.post('/saveStudentAnswer', function(req,res){
  if(req.body['answers']){
    var answers = req.body['answers'];
    var ans_arr = [];
    var ans = [];
    answers.forEach(function(ansRes) {
      ans = [];
      ans.push(null);
      ans.push(ansRes['answer_id']);
      ans.push(parseInt(ansRes['question_id']));
      ans.push(parseInt(ansRes['certificate_id']));
      ans.push(ansRes['section_id']);
      ans.push(parseInt(ansRes['student_id']));
      ans.push(moment().format('YYYY-MM-DD'));
      ans.push(parseInt(ansRes['passfail']));
      ans_arr.push(ans);
    });
    connection.query("INSERT INTO `cs_student_answer` (stu_answer_id, answer_id, question_id, certificate_id, section_id, student_id, data_added, passfail) VALUES ?",[ans_arr],function (err1, results1) {
     if(err1) {
        res.status(200).json({'status':0,'message' : err1.message , 'code' : 'ANSERROR'});
     }else{
        res.status(200).json({'status':1,'message' : 'Answers inserted successfully' , 'code' : 'SUCCESS'});
     }
    });
  } else {
    res.status(303).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
})

/*
  Author : Poonam Gokani
  Desc   : Webservice for save student result
  Date   : 04/08/2017
 */
app.post('/saveStudentResult', function(req,res){
  if(req.body['resultdetails']){
    connection.query("INSERT INTO `cs_std_section_result` SET ?;",[req.body['resultdetails']],function (err1, results1) {
     if(err1) {
       res.status(200).json({'status':0,'message' : err1.message , 'code' : 'ResultInsertionError'});
     }else{
       res.status(200).json({'status':1,'message' : 'Result inserted successfully' , 'code' : 'SUCCESS'});
     }
    });
  } else {
    res.status(303).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
})

/*
  Author : Poonam Gokani
  Desc   : Webservice to reset student password (send reset link to student)
  Date   : 31/07/2017
 */
app.post('/resetPassword',function(req,res){
  if(req.body['emailId'] && req.body['emailId'].trim() != '')
  {
  connection.query("SELECT * FROM cs_students where student_active_email='"+req.body['emailId']+"'",{},
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
  Desc   : Webservice to set new password for student
  Date   : 31/7/2017
 */
app.post('/updateResetPassword',function(req,res){
  console.log('Inside Update Reset Password');
  console.log(req.body);
  if(req.body['accessToken'] && req.body['accessToken'].trim() != '' && req.body['student_password'] && req.body['student_password'].trim() != '')
  {
    req.body['student_password'] = common.encrypt(req.body['student_password']);
    connection.query("SELECT * FROM cs_students where accessToken='"+req.body['accessToken']+"'",{},
      function(err, user) {
          if(user && user.length>0){
            connection.query('UPDATE cs_students SET ? WHERE ?', [{ student_password: req.body["student_password"] }, { accessToken: req.body["accessToken"] }],function(err , result){
               if (err) {
                res.status(200).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
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
    res.status(200).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
})


/*
  Author : Poonam Gokani
  Desc   : Function to send updated password information to student
  Date   : 24/07/2017
 */
function sendUpdateResetPasswordMail(student){
  console.log(student);
  var FROM_ADDRESS = 'support@Certspring.com';
  var TO_ADDRESS = student.student_active_email;
  var SUBJECT = 'Certspring Student account password changed';
  var DATE =moment().format('MM/DD/YYYY');
  var html =  "Dear "+ student.student_first_name+" "+ student.student_last_name+",<br><br>" +
  "Please note that a password has been changed, as per your request on "+DATE+"<br><br>"+
  "<b>Username:</b>"+ student.student_active_email+" <br>"+
  "<b>Password:</b>"+common.decrypt(student.student_password)+"<br><br>"+
  "Best regards,<br>The Certspring Team<br>" +
  "support@Certspring.com";
  console.log(html);
  mailer.sendMail(FROM_ADDRESS, TO_ADDRESS, SUBJECT, html, function(err, success){
    if(err){
      throw new Error('Problem sending email to: ' + TO_ADDRESS);
    }
    // Yay! Email was sent, now either do some more stuff or send a response back to the client
    res.send('Email sent: ' + success);
  });
}

/*
  Author : Poonam Gokani
  Desc   : Send reset password mail
  Date   : 31/07/2017
 */

function sendResetPasswordMail(user){

  var FROM_ADDRESS = 'support@Certspring.com';
  var TO_ADDRESS = user.student_active_email;
  var SUBJECT = 'Reset Password Link';

  var html =  "This email has been sent as a request to reset our password<br><br>" +
  "<a href='http://localhost:3000/#/student/resetPassword?accessToken="+user.accessToken+"'>Click here </a>"+
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

module.exports = app;