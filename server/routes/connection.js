var mysql = require('mysql')

var client = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'certspring',
  dateStrings: 'date'
})


/**
 * Setup a client to automatically replace itself if it is disconnected.
 *
 * @param {Connection} client
 *   A MySQL connection instance.
 */
function replaceClientOnDisconnect(client) {
  client.on("error", function (err) {
    if (!err.fatal) {
      return;
    }

    if (err.code !== "PROTOCOL_CONNECTION_LOST") {
      throw err;
    }

    // client.config is actually a ConnectionConfig instance, not the original
    // configuration. For most situations this is fine, but if you are doing
    // something more advanced with your connection configuration, then
    // you should check carefully as to whether this is actually going to do
    // what you think it should do.
    client = mysql.createConnection(client.config);
    replaceClientOnDisconnect(client);
    client.connect(function (error) {
      if (error) {
        // Well, we tried. The database has probably fallen over.
        // That's fairly fatal for most applications, so we might as
        // call it a day and go home.
        //
        // For a real application something more sophisticated is
        // probably required here.
        process.exit(1);
      }
    });
  });
}

// And run this on every connection as soon as it is created.
replaceClientOnDisconnect(client);

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