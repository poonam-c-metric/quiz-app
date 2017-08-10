/*
  Author : Poonam Gokani
  Desc   : All WebService Like hasResourceData,hasCertificateData to check certificate publishable or not
  Date   : 31/07/2017
 */
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var router = express.Router();
var connection = require('../connection.js');
var jwt    = require('jsonwebtoken');
var common = require('../common.js');
var crypto = require('crypto');

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
  Desc   : Webservice for check certificate contains resource or not
  Date   : 31/07/2017
 */
app.get('/hasResourceData',function(req,res){
  console.log(req.query['certificate_id']);
  if(req.query['certificate_id'] && req.query['certificate_id'] != ''){
    connection.query("SELECT COUNT(resource_id) as totalResource FROM cs_resources where certificate_id='"+req.query['certificate_id']+"'",{},
      function(err, data) {
        if(data && data.length > 0){
          res.status(200).json({'status':1, 'contentCount' : data[0]['totalResource'] });
        }else{
          res.status(200).json({'status':1, 'contentCount' : 0 });
        }
      })
  }else{
    res.status(200).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});
/*
  Author : Poonam Gokani
  Desc   : Webservice for check certificate contains any question or not
  Date   : 01/08/2017
 */
app.get('/hasQuestionData',function(req,res){
  var hasQuestionFlag = false;
  if(req.query['certificate_id'] && req.query['certificate_id'] != ''){
    connection.query("SELECT resource_id FROM cs_resources where certificate_id='"+req.query['certificate_id']+"'",{},
      function(err, data) {
        var counter = 0;
        if(data && data.length > 0){
          data.forEach(function(contentData){
              connection.query("SELECT question_id FROM cs_questions where certificate_id='"+req.query['certificate_id']+"'",{},
                function(err, questiondata) {
                  if(questiondata && questiondata.length > 0){
                    console.log('Question Data Exists');
                    console.log(questiondata.length);
                    hasQuestionFlag = true;
                  }
                  counter++;
                  if(counter==data.length && hasQuestionFlag){
                    console.log('Inside If condition true:'+hasQuestionFlag);
                    res.status(200).json({'status':1, 'hasQuestionFlag' : hasQuestionFlag });
                  }
              });
          });
        }else{
          res.status(200).json({'status':1, 'hasQuestionFlag' : hasQuestionFlag });
        }
      });
  }else{
    res.status(200).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});
/*
  Author : Poonam Gokani
  Desc   : Webservice for publish certificate
  Date   : 02/08/2017
 */
app.post('/publishCertificate',function(req,res){
  console.log('Inside publish certificate service');
  if(req.body['cert_data'] && req.query['cert_data'] != ''){
    var cert_data = req.body['cert_data'];
    var publish_code = crypto.randomBytes(15).toString('hex');
    cert_data['publish_code'] = publish_code;
    connection.query("INSERT INTO `cs_publish` SET ?",cert_data,function (err, results) {
       if (err) {
        res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
       }else{
        connection.query("Update cs_certificate set is_active = 1 where certificate_id="+req.body['cert_data']['certificate_id'],{},function(err,data){
          if(err){
            console.log(err);
            res.status(200).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
          }else{
            res.status(200).json({'status':1,'message': 'Certificate published successfully' ,'code': 'SUCCESS'});
          }
        });
       }
    });
  }else{
    res.status(200).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});

/*
  Author : Poonam Gokani
  Desc   : Webservice for unpublish certificate
  Date   : 02/08/2017
 */
app.post('/unpublishCertificate',function(req,res){
  console.log('Inside publish certificate service');
  if(req.body['cert_data'] && req.query['cert_data'] != ''){
    var cert_data = req.body['cert_data'];
    var publish_code = crypto.randomBytes(15).toString('hex');
    cert_data['publish_code'] = publish_code;
    connection.query("Update `cs_publish` SET ?",cert_data,function (err, results) {
       if (err) {
        res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
       }else{
        connection.query("Update cs_certificate set is_active = 0 where certificate_id="+req.body['cert_data']['certificate_id'],{},function(err,data){
          if(err){
            res.status(200).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
          }else{
            res.status(200).json({'status':1,'message': 'Certificate Unpublished successfully' ,'code': 'SUCCESS'});
          }
        });
       }
    });
  }else{
    res.status(200).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});

module.exports = app;