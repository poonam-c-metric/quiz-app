var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var moment = require('moment');
var multer = require('multer');
var router = express.Router();
var connection = require('../connection.js');
var mailer = require('../mailer.js');
var jwt    = require('jsonwebtoken');
var common = require('../common.js');
var fs = require('fs');
var https = require('https');

const app = express();

//connection.connect();

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
  Author : Niral Patel
  Desc   : Get question detail
  Date   :8/6/2016
 */

 app.get('/getQuestionDetails',IsAuthenticated, function(req,res){
  if(req.query['section_id'] && req.query['section_id'].trim() != '')
  {
  connection.query("SELECT question_id,question_text,is_active,question_order FROM cs_questions where is_deletable = 0 and section_id=?" , [req.query.section_id] ,
      function(err, questiondata) {
          if(questiondata && questiondata.length>0){
            res.status(200).json({"status":1,'message':'question details','question' : questiondata });
          }else{
            res.status(200).json({"status":0,'message': 'Question details not found' ,'code': 'No Data'});
          }
      })
  }
  else
  {
    res.status(303).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});

 /*
  Author : Poonam Gokani
  Desc   : Get question Ids
  Date   : 12/07/2017
 */

 app.get('/getQuestionIds',IsAuthenticated, function(req,res){
  if(req.query['section_id'] && req.query['section_id'].trim() != '')
  {
    connection.query("SELECT question_id FROM cs_questions where is_deletable = 0 and section_id=?" , [req.query.section_id] ,
      function(err, questiondata) {
          if(questiondata && questiondata.length>0){
            res.status(200).json({"status":1,'message':'question details','question' : questiondata });
          }else{
            res.status(200).json({"status":0,'message': 'Question details not found' ,'code': 'No Data'});
          }
      })
  }
  else
  {
    res.status(303).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});

 /*
  Author : Niral Patel
  Desc   : Change question status
  Date   :8/6/2016
 */

 app.post('/changeQuestionStatus', IsAuthenticated, function(req,res){
  if(req.body['question_id'] && req.body['question_id'] != '' && req.body['is_active'] !== ''){
    connection.query("SELECT question_id FROM cs_questions where question_id=?" , [req.body['question_id']] ,
      function(err, contentdata) {
          if(contentdata && contentdata.length>0){
                connection.query("Update `cs_questions` SET ? WHERE ?",[ req.body , { question_id : req.body.question_id }],function (err, results) {
                   if (err) {
                    res.status(303).json({"status":0,'message': err.message.split(":")[1],'code': err.code});
                   }else{
                     var status = req.body['is_active'] == 1?'Active':'Deactive';
                    res.status(200).json({"status":1,'message': status+' status successfully' ,'code': 'SUCCESS'});
                   }
                });
          }else{
            res.status(401).json({"status":0,'message': 'Oops! Question not found.!!' ,'code': 'Invalid Details'});
          }
      })
  }else{
    res.status(303).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});
 /*
  Author : Niral Patel
  Desc   : Get question by id
  Date   :9/6/2016
 */
app.get('/getQuestionById', IsAuthenticated, function(req,res){
  if(req.query['question_id'] && req.query['question_id'].trim() != '')
  {
  connection.query("SELECT question_id,question_text,question_order,question_type,certificate_id,section_id,date_added,is_active FROM cs_questions where question_id=?" , [req.query['question_id']] ,
      function(err, questiondata) {

          if(questiondata && questiondata.length>0){
            //get answer
            connection.query("SELECT answer_id,question_id,answer_text,is_correct,date_added,id_added,date_added,is_active FROM cs_answers where question_id=?" , [req.query['question_id']] ,
            function(err, answers) {
              if(answers && answers.length == 0){answers ={};}
              console.log(answers);
              res.status(200).json({"status":1,'message':'question data','question' : questiondata,'answers':answers });
            });

          }else{
            res.status(200).json({"status":0,'message': 'Question details not found' ,'code': 'No Data'});
          }
      })
  }
  else
  {
    res.status(303).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});
/*
  Author : Niral Patel
  Desc   : create question
  Date   :2/6/2016
 */
app.post('/createQuestion', IsAuthenticated, function(req, res){
      console.log(req.body);
      if(req.body['certificate_id'] && req.body['certificate_id'].trim() != '' && req.body['question_text'] && req.body['question_text'].trim() != ''
         && req.body['section_id'] && req.body['section_id'].trim() != '' && req.body['answers'] && req.body['answers'] != ''
         && req.body['id_added'] && req.body['id_added'] != '')
        {
          var answers = req.body['answers'];
          delete req.body["answers"];
          req.body.date_added=moment().format('YYYY-MM-DD');
          req.body.ip_added = req.connection.remoteAddress.replace(/^.*:/, '');

          connection.query("INSERT INTO `cs_questions` SET ?",req.body,function (err, results) {
           if (err) {
            console.log(err.message);
            res.status(303).json({"status":0,'message': err.message.split(":")[1],'code': err.code});
           }else{
            var ans_arr=[];
              answers.forEach(function(ansRes) {
                    var ans_arr = {
                      "question_id":results.insertId,
                      "answer_text":ansRes.answer_text,
                      "is_correct":ansRes.is_correct,
                      "id_added":req.body['id_added'],
                      "is_active":req.body['is_active'],
                      "date_added":moment().format('YYYY-MM-DD'),
                      "ip_added":req.connection.remoteAddress.replace(/^.*:/, '')
                    }
                    connection.query("INSERT INTO `cs_answers` SET ?",ans_arr,function (err1, results1) {
                     if (err1) {
                        //res.status(303).json({"status":0,'message': err1.message.split(":")[1],'code': err1.code});
                        console.log('Error occured'+err1.message);
                     }else{
                        console.log("Answer is inserted");
                     }
                    });
              });
            res.status(200).json({"status":1,'message': 'Question created Successfully' ,'code': 'SUCCESS'});
           }
        });
     }
    else
    {
      res.status(303).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
    }

});
/*
  Author : Poonam Gokani
  Desc   : Set Test Configuration
  Date   : 30/6/2016
 */
app.post('/saveTestConfiguration', IsAuthenticated, function(req, res){
  if(req.body['correct_answer'] && req.body['correct_answer'] != ''  && req.body['test_time'] && req.body['test_time'].trim() != ''){
    connection.query("Update `cs_resources` SET ? WHERE ?",[ req.body , { resource_id : req.body.resource_id }],function (err, results) {
      if(err){
        console.log(err.message);
        res.status(303).json({"status":0,'message': err.message.split(":")[1],'code': err.code});
      }else{
        res.status(200).json({"status":1,'message': 'Test configuration done successfully' ,'code': 'SUCCESS'});
      }
    });
  }else{
    res.status(303).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});

/*
  Author : Poonam Gokani
  Desc   : Get Test Configuration
  Date   : 30/6/2016
*/
app.get('/getTestConfiguration', IsAuthenticated, function(req, res){
  if(req.query['content_id'] && req.query['content_id'] != ''){
    connection.query("Select test_time , correct_answer FROM cs_resources where resource_id = ?" , [req.query['content_id']] ,function (err, results) {
      if(err){
        res.status(303).json({"status":0,'message': err.message.split(":")[1],'code': err.code});
      }else{
        res.status(200).json({"status":1, 'testdata': results[0]});
      }
    });
  }else{
    res.status(303).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});
/*
  Author : Niral Patel
  Desc   : Delete question
  Date   : 9/6/2016
 */
app.get('/deleteQuestion', IsAuthenticated, function(req,res){
  console.log(req.query['question_id']);
  if(req.query['question_id'] && req.query['question_id'].trim() != '')
  {
    var status = {"is_deletable": '1'};
    connection.query("Update `cs_questions` SET ? WHERE ?",[ status , { question_id : req.query.question_id }],
      function(err, results) {
          if(err){
            console.log(err);
            res.status(401).json({"status":0,'message': 'Oops! Something went wrong!!' ,'code': 'Invalid Details'});
          }else{
            res.status(200).json({"status":1,'message': 'Question deleted Successfully' ,'code': 'SUCCESS'});

          }
      })
    }
    else
    {
      res.status(303).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
    }
});

/*
  Author : Poonam Gokani
  Desc   : Upload Question Image
  Date   : 3/7/2017
 */
/** File Upload coding **/

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
      var dir = './src/uploads/question/';

      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }
        cb(null, './src/uploads/question/');
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
app.post('/uploadQuestion', function(req, res) {
  upload(req,res,function(err){
    if(err){
      res.status(200).json({'status':0,'message': err.message ,'code': 'FAIL'});
    }else{
      res.status(200).json({'status':1,'message':'File Uploaded Successfully','code': 'SUCCESS','filename': req.file.filename});
    }
  });
});


module.exports = app;