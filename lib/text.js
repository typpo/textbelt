var providers = require('./providers.js')
  , _ = require('underscore')
  , carriers = require('./carriers.js')
  , exec = require('child_process').exec
  , spawn = require('child_process').spawn;
var StringDecoder = require('string_decoder').StringDecoder;

var debugEnabled = false;

// NOTE: Change this if you are self-hosting!
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
function sendText(phone, message, carrier, region, cb) {
  output('txting phone', phone, ':', message);

  region = region || 'us';

  var providers_list;
  if (carrier == null) {
    providers_list = providers[region];
  } else {
    providers_list = carriers[carrier];
  }

  var done = _.after(providers_list.length, function() {
    cb(false);
  });

  _.each(providers_list, function(provider) {
    var email = provider.replace('%s', phone);
    var child = spawn('mail', ['-s', 'txt', '-a', 'From:' + fromAddress, email]);
    var decoder = new StringDecoder('utf8');
    child.stdout.on('data', function(data) {
      output(decoder.write(data));
    });
    child.stderr.on('data', function(data) {
      output(decoder.write(data));
    });
    child.on('error', function(data) {
      output('sendmail failed', {email: email, data: decoder.write(data)});
      done();
    });
    child.on('exit', function(code, signal) {
      done();
    });
    child.stdin.write(message + '\n');
    child.stdin.end();
  });
}

module.exports = {
  send:       sendText,     // Send a text message
  debug:      debug         // Enable or disable debug output
};
