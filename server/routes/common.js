var jwt = require('jsonwebtoken-refresh');
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
      /*
        Desc: Refresh token Code
        Date: 28/07/2017
      */
      //var originalDecoded = jwt.decode(req.headers['authorization'], {complete: true});
      //var refreshed = jwt.refresh(originalDecoded, (Date.now() / 1000) + 60, privateKey);
      //req.session.accessToken = refreshed;
      //console.log('Token refreshed'+ refreshed);
      //res.status(401).json({'status':0,'message': 'Token Expired' ,'code': 'UnAuthorized'});
      console.log('Inside else token expired');
    }
  });
}