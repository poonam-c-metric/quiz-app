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


app.post('/getCertificateDetails',function(req,res){
  if(req.body['member_id'] && req.body['member_id'].length > 0)
  {
  connection.query("SELECT * FROM cs_certificate where id_added=?" , [req.body.member_id] ,
      function(err, certdata) {
          if(certdata && certdata.length>0){
            res.status(200).json({'status':1,'message':'certificate','certificate' : certdata });
          }else{
            res.status(401).json({'status':0,'message': 'Oops! Something went wrong!!' ,'code': 'Invalid Details'});
          }
      })
  }
  else
  {
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});

app.post('/getCertificateById',function(req,res){
  if(req.body['certificate_id'] && req.body['certificate_id'].length > 0)
  {
  connection.query("SELECT * FROM cs_certificate where certificate_id=?" , [req.body.certificate_id] ,
      function(err, certdata) {
          if(certdata && certdata.length>0){
            res.status(200).json({'status':1,'message':'certificate','certificate' : certdata });
          }else{
            res.status(401).json({'status':0,'message': 'Oops! Something went wrong!!' ,'code': 'Invalid Details'});
          }
      })
  }
  else
  {
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});

app.post('/createCertificate',function(req, res){
  if(req.body['certificate_name'] && req.body['certificate_name'].length > 0)
  {
    req.body.date_added=moment().format('YYYY-MM-DD');
    req.body.ip_added = req.connection.remoteAddress.replace(/^.*:/, '');
    connection.query('SELECT * FROM cs_certificate where certificate_name=?',req.body['certificate_name'],
          function(err, rows) {
              if (err) {
                throw err;
              }
              else if(rows.length>0){
                res.status(303).json({'status':0,'message': 'Program name already exists. Please enter different certificate name.','code': 'Duplicate Entry'});
              } else {
                connection.query("INSERT INTO `cs_certificate` SET ?",req.body,function (err, results) {
                   if (err) {
                    res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
                   }else{
                    res.status(200).json({'status':1,'message': 'Certificate created Successfully' ,'code': 'SUCCESS'});
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

app.post('/updateCertificate',function(req, res){
  if(req.body['certificate_name'] && req.body['certificate_name'].length > 0 && req.body['certificate_id'] && req.body['certificate_id'].length > 0)
  {
  req.body.date_edited=moment().format('YYYY-MM-DD');
  req.body.ip_edited = req.connection.remoteAddress.replace(/^.*:/, '');
  connection.query("Update `cs_certificate` SET ? WHERE ?",[ req.body , { certificate_id : req.body.certificate_id }],function (err, results) {
     if (err) {
      res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
     }else{
      if(results.affectedRows)
        res.status(200).json({'status':1,'message': 'Certificate updated Successfully' ,'code': 'SUCCESS'});
     }
  });
  }
  else
  {
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});

app.post('/deleteCertificateById',function(req,res){
    console.log(req.query.certificate_id);
   if(req.body['certificate_id'] && req.body['certificate_id'].length > 0)
   {
      connection.query("Delete FROM cs_certificate where certificate_id =?",req.body.certificate_id,function (err, results) {
        if (err) {
          res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
        }else{
          if(results.affectedRows)
            res.status(200).json({'status':1,'message': 'Certificate deleted Successfully' ,'code': 'SUCCESS'});
        }
      });
    }
    else
    {
      res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
    }
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
      res.status(200).json({'status':0,'message': err.message ,'code': 'FAIL'});
    }else{
      res.status(200).json({'status':1,'message':'File Uploaded Successfully','code': 'SUCCESS','filename': req.file.filename});
    }

  });
});

module.exports = app;