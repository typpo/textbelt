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

  var emails = providers_list.map(function(provider) {
    return provider.replace('%s', phone);
  }).join(',');
  var args = ['-s', 'txt', '-e', 'set from=' + fromAddress,
    '-e', 'set use_from=yes', '-e', 'set envelope_from=yes', '-b', emails];
  var child = spawn('mutt', args);
  var decoder = new StringDecoder('utf8');
  child.stdout.on('data', function(data) {
    output(decoder.write(data));
  });
  child.stderr.on('data', function(data) {
    output(decoder.write(data));
  });
  child.on('error', function(data) {
    output('mutt failed', {email: emails, data: decoder.write(data)});
    cb(false);
  });
  child.on('exit', function(code, signal) {
    cb(false);
  });
  console.log(message);
  child.stdin.write(message);
  child.stdin.end();
}

module.exports = {
  send:       sendText,     // Send a text message
  debug:      debug         // Enable or disable debug output
};
