var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var  algorithm = 'aes-256-ctr';
var privateKey = 'c-metricsolution';

exports.decrypt = function(password) {
    var decipher = crypto.createDecipher(algorithm, privateKey);
    var dec = decipher.update(password, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

// method to encrypt data(password)
exports.encrypt = function(password) {
    var cipher = crypto.createCipher(algorithm, privateKey);
    var crypted = cipher.update(password, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

IsAuthenticated = function(req,res,next){
  jwt.verify(req.headers['authorization'], privateKey, function(err, decoded) {
    if(decoded){
      next();
    }else{
      res.status(401).json({'status':0,'message': 'Unauthorized User' ,'code': 'UnAuthorized'});
    }
  });
}