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
  res.header("Access-Control-Allow-Origin", "http://localhost:4200");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});



app.get('/getCertificateDetails',IsAuthenticated,function(req,res){
  if(req.query.member_id && req.query.member_id!= ''){
    connection.query("SELECT * FROM cs_certificate where is_delete = 0 and id_added=?" , [req.query.member_id] ,
      function(err, certdata) {
          if(certdata && certdata.length>0){
            res.status(200).json({'status':1,'message':'certificate','certificate' : certdata });
          }else{
            res.status(200).json({'status':0,'message': 'No Certificate Data, Create new one' ,'code': 'Data not Exist'});
          }
      })
  }else{
    res.status(200).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
});

app.get('/getCertificateById',IsAuthenticated,function(req,res){
  if(req.query['certificate_id'] && req.query['certificate_id']!= '')
  {
  connection.query("SELECT * FROM cs_certificate where certificate_id=?" , [req.query.certificate_id] ,
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

app.post('/createCertificate',IsAuthenticated,function(req, res){
  if(req.body['certificate_name'] && req.body['certificate_name'].trim() != '')
  {
    req.body.date_added=moment().format('YYYY-MM-DD');
    req.body.ip_added = req.connection.remoteAddress.replace(/^.*:/, '');
    connection.query('SELECT * FROM cs_certificate where certificate_name=? and is_delete = ?',[req.body['certificate_name'],0],
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

app.post('/updateCertificate', IsAuthenticated, function(req, res){
  if(req.body['certificate_name'] && req.body['certificate_name'].trim() != '' && req.body['certificate_id'] && req.body['certificate_id']!= '')
  {
  req.body.date_edited=moment().format('YYYY-MM-DD');
  req.body.ip_edited = req.connection.remoteAddress.replace(/^.*:/, '');
  connection.query('SELECT * FROM cs_certificate where certificate_name=? and certificate_id != ?',[req.body['certificate_name'],req.body['certificate_id']],
    function(err, rows) {
        if (err) {
          throw err;
        }
        else if(rows.length>0){
          res.status(303).json({'status':0,'message': 'Program name already exists. Please enter different certificate name.','code': 'Duplicate Entry'});
        } else {
          connection.query("Update `cs_certificate` SET ? WHERE ?",[ req.body , { certificate_id : req.body.certificate_id }],function (err, results) {
            if (err) {
              res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
            }else{
              if(results.affectedRows)
                res.status(200).json({'status':1,'message': 'Certificate updated Successfully' ,'code': 'SUCCESS'});
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

app.delete('/deleteCertificateById',IsAuthenticated, function(req,res){
  if(req.query.certificate_id && req.query.certificate_id != ''){
     var status = {"is_delete": '1'};
     connection.query("Update `cs_certificate` SET ? WHERE ?",[ status , { certificate_id : req.query.certificate_id }],
      function (err, results) {
      if (err) {
        res.status(303).json({'status':0,'message': err.message.split(":")[1],'code': err.code});
      }else{
        if(results.affectedRows)
          res.status(200).json({'status':1,'message': 'Certificate deleted Successfully' ,'code': 'SUCCESS'});
      }
    });
  }else{
    res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
  }
})

/*function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else {
      res.status(401).json({'status':0,'message': 'Unauthorized User' ,'code': 'Unauthorized'});
    }
}*/

/** File Upload coding **/

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './src/uploads/');
    },
    filename: function (req, file, cb) {
      var datetimestamp = Date.now();
      cb(null, file.originalname.split('.')[0] + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});

var upload = multer({ //multer settings
    storage: storage
  }).single('file');


/** API path that will upload the files */
app.post('/upload', function(req, res) {
  console.log('Inside File Upload');
  upload(req,res,function(err){
    if(err){
      res.status(200).json({'status':0,'message': err.message ,'code': 'FAIL'});
    }else{
      res.status(200).json({'status':1,'message':'File Uploaded Successfully','code': 'SUCCESS','filename': req.file.filename});
    }

  });
});

module.exports = app;