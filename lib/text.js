var providers = require('./providers.js')
  , _ = require('underscore')
  , exec = require('child_process').exec
  , spawn = require('child_process').spawn;

var debugEnabled = false;
var fromAddress = 'foo@bar.com';

//----------------------------------------------------------------
/*
    General purpose logging function, gated by a configurable
    value.
*/
function output() {
  if (debugEnabled) {
    return console.log.apply(this, arguments);
  }
}

//----------------------------------------------------------------
/*  Enable verbosity for the text module.

    If enabled, logging functions will
    print to stdout.

    Params:
      enable - bool
*/
function debug(enable) {
  debugEnabled = enable;
  return debugEnabled;
}

//----------------------------------------------------------------
/*  Sends a text message

    Will perform a region lookup (for providers), then
    send a message to each.

    Params:
      phone - phone number to text
      message - message to send
      region - region to use (defaults to US)
      cb - function(err), provides err messages
*/
function sendText(phone, message, region, cb) {
  output('txting phone', phone, ':', message);

  region = region || 'us';

  var providers_list = providers[region];

  var done = _.after(providers_list.length, function() {
    cb(false);
  });

  _.each(providers_list, function(provider) {
    var email = provider.replace('%s', phone);
    email = 'Subject: Text\r\n\r\n' + email;
    var child = spawn('sendmail', ['-f', fromAddress, email]);
    child.stdout.on('data', output);
    child.stderr.on('data', output);
    child.on('error', function(data) {
      output('sendmail failed', {email: email, data: data});
      done();
    });
    child.on('exit', function(code, signal) {
      done();
    });
    child.stdin.write(message + '\n.');
    child.stdin.end();
  });
}

module.exports = {
  send:       sendText,     // Send a text message
  debug:      debug         // Enable or disable debug output
};
