/**
 * Author : Poonam Gokani
 * Date : 13/04/2017
 * Desription : Code to do connection with mysql database
 */
var mysql = require('mysql')

var db_config = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'certspring',
  dateStrings: 'date'
}

var client = mysql.createConnection(db_config);


/**
 * Author : Poonam Gokani
 * Date : 21/07/2017
 * Desription : Handle disconnect issue after idle timeout , Protocol Disconnected Issue
 */

function handleDisconnect(connection) {
  connection.on('error', function(err) {
    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(connection);
    }else{
      //throw err;
      handleDisconnect(connection);
    }
    connection = mysql.createConnection(db_config);
    connection.connect(function(err) {
      if(err) {
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000);
      }
    });
  });
}

handleDisconnect(client);

/**
 * Every operation requiring a client should call this function, and not
 * hold on to the resulting client reference.
 *
 * @return {Connection}
 */
exports.getClient = function () {
  return client;
};

module.exports = client;
