var mysql = require('mysql')

var client = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'certspring',
  dateStrings: 'date'
})


/**
 * Author : Poonam Gokani
 * Date : 06/07/2017
 * Desription : Handle disconnect issue after idle timeout
 */

function handleDisconnect(connection) {
  connection.on('error', function(err) {
    if (!err.fatal) {
      return;
    }
    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }
    connection = mysql.createConnection({host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'certspring',
        dateStrings: 'date'});
    handleDisconnect(connection);
    connection.connect();
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