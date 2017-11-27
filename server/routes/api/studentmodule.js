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
                if(req.body['send_email'] && req.body['send_email'] == 1)
                {
                  sendUpdateResetPasswordMail(student[0],req.get('host'));
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
    var counter = 0;
    var ans_arr = [];
    var ans = [];
    var correctflag = 1;
    var certificate_id = parseInt(req.body['certificate_id']);
    var student_id = parseInt(req.body['student_id']);
    var resource_id = parseInt(req.body['resource_id']);
    var answerDetail = req.body['resultData'];
    var studentEmail = req.body['student_email'];
    answers.forEach(function(ansRes) {
      connection.query("select answer_id from cs_answers where question_id ='"+ ansRes['question_id'] + "' and is_correct = 1",function(err,result){
        counter++;
        if(typeof ansRes['answer_id'] != 'object'){
          ans = [];
          ans.push(null);
          ans.push(parseInt(ansRes['question_id']));
          ans.push(certificate_id);
          ans.push(resource_id);
          ans.push(student_id);
          ans.push(moment().format('YYYY-MM-DD'));
          ans.push(ansRes['answer_id']);
          if(result[0]['answer_id'] ==  ansRes['answer_id']){
            ans.push(1);
          }else{
            ans.push(0);
          }
          ans_arr.push(ans);
        }else{
          correctflag = 1;
          if(result.length == ansRes['answer_id'].length){
            result.forEach(function(correctans){
              if(!correctans['answer_id'] in ansRes['answer_id']){
                correctflag = 0;
              }
            });
          }else{
            correctflag = 0;
          }
          ansRes['answer_id'].forEach(function(ansdata){
            ans = [];
            ans.push(null);
            ans.push(parseInt(ansRes['question_id']));
            ans.push(certificate_id);
            ans.push(resource_id);
            ans.push(student_id);
            ans.push(moment().format('YYYY-MM-DD'));
            ans.push(ansdata);
            ans.push(correctflag);
            ans_arr.push(ans);
          })
        }

        if(counter == answers.length){
          connection.query("INSERT INTO `cs_student_answer` (stu_answer_id, question_id, certificate_id, resource_id, student_id, data_added, answer_id, passfail) VALUES ?",[ans_arr],function (err1, results1) {
            if(err1) {
              res.status(200).json({'status':0,'message' : err1.message , 'code' : 'ANSERROR'});
            }else{
              generateStudentResult(student_id,resource_id,res,answerDetail,studentEmail);
            }
          });
        }
      });
    });

  } else {
    res.status(200).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
})

function generateStudentResult(student_id,resource_id,res,answerDetail,student_email){
  var score_needed = "";
  var score_get = "";
  var total_question = 10;
  var resultdata = {};
  connection.query("Select correct_answer from cs_resources where resource_id = '"+resource_id+"'" ,function(error,result){
    score_needed = result[0]['correct_answer'];
    connection.query("SELECT COUNT(DISTINCT question_id) AS correct_answer FROM `cs_student_answer` where passfail='1' and resource_id = '"+ resource_id +"' and student_id ='"+student_id+"'",function(error,result){
      score_get = result[0]['correct_answer'];
      if(score_get >= score_needed)
        resultdata['pass_fail'] = 1;
      else
        resultdata['pass_fail'] = 2;
      resultdata['student_id'] = student_id;
      resultdata['resource_id'] = resource_id;
      resultdata['percentage'] = 100 * score_get / total_question;
      connection.query("select MAX(test_attempts) as test_attempts from cs_std_section_result where student_id= '"+ student_id+"' and resource_id = '"+ resource_id  +"' GROUP BY student_id, resource_id",function(error,data){
          console.log('maximum test attempts');
          console.log(data);
          if(data.length != 0){
            resultdata['test_attempts'] = data[0]['test_attempts'] + 1;
            console.log(resultdata['test_attempts']);
          }
          connection.query("INSERT INTO `cs_std_section_result` SET ?;",[resultdata],function (err1, results1) {
            if(err1) {
              res.status(200).json({'status':0,'message' : err1.message , 'code' : 'ResultInsertionError'});
            }else{
              sendResultMail(resultdata,answerDetail,student_email);
              res.status(200).json({'status':1,'message' : 'Result inserted successfully' , 'code' : 'SUCCESS' , 'result': resultdata});
            }
          });
      });
    });
  });
}

/*
  Author : Poonam Gokani
  Desc   : Webservice for save student result
  Date   : 04/08/2017
 */
app.post('/saveStudentResult', function(req,res){
  console.log('Inside saveStudentResult');
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
                sendUpdateResetPasswordMail(user[0],req.get('host'));
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
  Desc   : Get content details based on Student Id
  Date   : 10/08/2017
 */
app.get('/getContentForStudent',IsAuthenticated,function(req,res){
  if(req.query['certificate_id'] && req.query['certificate_id'] != '' && req.query['student_id'] && req.query['student_id']!='')
  {
    connection.query("SELECT cr.resource_id, cr.certificate_id, cr.resource_name, cr.description, TIME_TO_SEC(cr.test_time)/60 as test_time, cr.points, cr.web_image, count(ssr.resource_id) as student_attempted_flag, ssr.pass_fail , MAX(ssr.percentage) as percentage from cs_resources cr LEFT JOIN cs_std_section_result as ssr  ON cr.resource_id = ssr.resource_id where cr.certificate_id= "+req.query.certificate_id+" and cr.is_delete = 0 GROUP BY cr.resource_id",
      function(err, contentdata) {
          if(contentdata && contentdata.length>0){
            res.status(200).json({"status":1,'message':'content details','content' : contentdata });
          }else{
            res.status(200).json({"status":0,'message': 'Content details not found' ,'code': 'No Data'});
          }
      })
  }
  else
  {
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});

/*
  Author : Poonam Gokani
  Desc   : Function to send updated password information to student
  Date   : 24/07/2017
*/
function sendUpdateResetPasswordMail(student,api_url){
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

function sendResetPasswordMail(user,api_url){

  var FROM_ADDRESS = 'support@Certspring.com';
  var TO_ADDRESS = user.student_active_email;
  var SUBJECT = 'Reset Password Link';

  var html =  "This email has been sent as a request to reset our password<br><br>" +
  "<a href="+api_url+"/#/student/resetPassword?accessToken="+user.accessToken+"'>Click here </a>"+
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
  Author : Poonam Gokani
  Desc   : Send reset password mail
  Date   : 31/07/2017
 */

function sendResultMail(resultdata,answerDetail,studentEmail){

  var FROM_ADDRESS = 'support@Certspring.com';
  var TO_ADDRESS = studentEmail;
  var html = "";
  var SUBJECT = 'Test Results';
  var greetingStr = "";
  var answerData = "<table><tr><th>Question</th><th>Your Answer</th></tr>"

  if(resultdata['pass_fail']==1){
    greetingStr = "Congratulation! You passed test successfully <br/>";
  } else {
    greetingStr = "Oops, You did not Pass. <br/>";
  }

  answerDetail.forEach(function(value,key){
    answerData = "<tr>";
    answerData += "<td>" + value['question_text'] + "</td>";
    answerData += "<td>" + value['your_answer'] + "</td>";
    answerData = "</tr>";
  });

  answerData += "</table>";

  var footer = "Best regards,<br>The Certspring Team<br>" +
  "support@Certspring.com";

  html = greetingStr + answerData + footer;

  mailer.sendMail(FROM_ADDRESS, TO_ADDRESS, SUBJECT, html, function(err, success){
    if(err){
      throw new Error('Problem sending email to: ' + TO_ADDRESS);
    }
    // Yay! Email was sent, now either do some more stuff or send a response back to the client
    res.send('Email sent: ' + success);
  });
}

module.exports = app;