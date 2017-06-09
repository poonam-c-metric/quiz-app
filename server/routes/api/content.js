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
  Author : Niral Patel
  Desc   : Get content detail
  Date   :1/6/2016
 */

 app.get('/getContentDetails',function(req,res){
  if(req.query['certificate_id'] && req.query['certificate_id'].trim() != '')
  {
  connection.query("SELECT * FROM cs_resources where certificate_id=?" , [req.query.certificate_id] ,
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
  Author : Niral Patel
  Desc   : Get content by id
  Date   :5/6/2016
 */
app.get('/getContentById',function(req,res){
  if(req.query['resource_id'] && req.query['resource_id'].trim() != '')
  {
    connection.query("SELECT * FROM cs_resources where resource_id=?" , [req.query['resource_id']] ,
      function(err, contentdata) {
        if(contentdata && contentdata.length>0){
          res.status(200).json({"status":1,'message':'content data','content' : contentdata });
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
/*
  Author : Niral Patel
  Desc   : create content
  Date   :2/6/2016
 */
app.post('/createContent',function(req, res){


      delete req.body["student_confirm_password"];
       if(req.body['certificate_id'] && req.body['certificate_id'].trim() != '' && req.body['resource_name'] && req.body['resource_name'].trim() != ''
         && req.body['description'] && req.body['description'].trim() != '' && req.body['url_link'] && req.body['url_link'].trim() != ''
         && req.body['web_image'] && req.body['web_image'].trim() != '' && req.body['id_added'] && req.body['id_added'].trim() != '')
        {

        req.body.date_added=moment().format('YYYY-MM-DD');
        req.body.ip_added = req.connection.remoteAddress.replace(/^.*:/, '');
        connection.query('SELECT * FROM cs_resources where resource_name=?',req.body['resource_name'],
          function(err, rows) {
              if (err) {
                throw err;
              }
              else if(rows.length>0){
                res.status(303).json({"status":0,'message': 'Content Name already exists. Please enter different content name.','code': 'Content Exists'});
              }else{
                connection.query("INSERT INTO `cs_resources` SET ?",req.body,function (err, results) {
                   if (err) {
                    res.status(303).json({"status":0,'message': err.message.split(":")[1],'code': err.code});
                   }else{

                    res.status(200).json({"status":1,'message': 'Content created Successfully' ,'code': 'SUCCESS'});
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
/*
  Author : Niral Patel
  Desc   : update content
  Date   :5/6/2016
 */
app.post('/updateContent',function(req, res){


      delete req.body["student_confirm_password"];
       if(req.body['resource_id'] && req.body['resource_id'].trim() != '' && req.body['certificate_id'] && req.body['certificate_id'].trim() != '' && req.body['resource_name'] && req.body['resource_name'].trim() != ''
         && req.body['description'] && req.body['description'].trim() != '' && req.body['url_link'] && req.body['url_link'].trim() != ''
         && req.body['web_image'] && req.body['web_image'].trim() != '' && req.body['id_added'] && req.body['id_added'].trim() != '')
        {

        req.body.date_edited=moment().format('YYYY-MM-DD');
        req.body.ip_edited = req.connection.remoteAddress.replace(/^.*:/, '');
        connection.query('SELECT * FROM cs_resources where resource_id != '+req.body['resource_id']+' and resource_name=?',req.body['resource_name'],
          function(err, rows) {
              if (err) {
                throw err;
              }
              else if(rows.length>0){
                res.status(303).json({"status":0,'message': 'Content Name already exists. Please enter different content name.','code': 'Content Exists'});
              }else{
                  connection.query("Update `cs_resources` SET ? WHERE ?",[ req.body , { resource_id : req.body.resource_id }],function (err, results) {
                   if (err) {
                    res.status(303).json({"status":0,'message': err.message.split(":")[1],'code': err.code});
                   }else{

                    res.status(200).json({"status":1,'message': 'Content updated Successfully' ,'code': 'SUCCESS'});
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
/*
  Author : Niral Patel
  Desc   : Delete content
  Date   : 5/6/2016
 */
app.get('/deleteContent',function(req,res){
  if(req.query['resource_id'] && req.query['resource_id'].trim() != '')
  {
  connection.query("Delete from cs_resources where resource_id=?" , [req.query['resource_id']] ,
      function(err, results) {
          if(err){
            res.status(401).json({"status":0,'message': 'Oops! Something went wrong!!' ,'code': 'Invalid Details'});
          }else{
            res.status(200).json({"status":1,'message': 'Content deleted Successfully' ,'code': 'SUCCESS'});

          }
      })
    }
    else
    {
      res.status(401).json({'status':0,'message': 'Required parameter missing or null' ,'code': 'Invalid Parameter'});
    }
});
/*
  Author : Niral Patel
  Desc   : create content
  Date   :2/6/2016
 */
/** File Upload coding **/

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
      var dir = './src/uploads/content/';

      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }
        cb(null, './src/uploads/content/');
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
app.post('/uploadDocument', function(req, res) {
  upload(req,res,function(err){
    if(err){
      res.status(200).json({'status':0,'message': err.message ,'code': 'FAIL'});
    }else{
      res.status(200).json({'status':1,'message':'File Uploaded Successfully','code': 'SUCCESS','filename': req.file.filename});
    }

  });
});


module.exports = app;