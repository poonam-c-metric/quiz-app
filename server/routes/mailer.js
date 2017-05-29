var nodemailer = require('nodemailer');
var path = require('path');
var templatesDir = path.resolve(__dirname, '/templates/confirm-email/');
var emailTemplates = require('email-templates');

// Its not a good idea to provide your credentials like this, they should come from an external source. This is only for the demo.
var EMAIL_ACCOUNT_USER = 'poonam.gokani.0@gmail.com';
var EMAIL_ACCOUNT_PASSWORD = 'poonam@2017'
var YOUR_NAME = 'Poonam';

//reusable transport, look at the docs to see other service/protocol options
var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: EMAIL_ACCOUNT_USER,
      pass: EMAIL_ACCOUNT_PASSWORD
    }
});

// Public method that actually sends the email
exports.sendMail = function(fromAddress, toAddress, subject, content, next){
  var success = true;
  var mailOptions = {
    // NOTE: the fromAdress can actually be different than the email address you're sending it from. Which is good and bad I suppose. Use it wisely.
    from: YOUR_NAME + ' <' + fromAddress + '>',
    to: toAddress,
    replyTo: fromAddress,
    subject: subject,
    html: content
  };

  // send the email!
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.log('[ERROR] Message NOT sent: ', error);
      success = false;
    }
    else {
      console.log('[INFO] Message Sent: ' + response.message);
    }
    next(error, success);
  });
};