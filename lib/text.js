var providers = require('./providers.js'),
    carriers = require('./carriers.js'),
    spawn = require('child_process').spawn,
    StringDecoder = require('string_decoder').StringDecoder,
    config = require('./config.js');

//----------------------------------------------------------------
/*
    General purpose logging function, gated by a configurable
    value.
*/
function output() {
  if (config.debugEnabled) {
    return console.log.apply(this, arguments);
  }
}

//----------------------------------------------------------------
/*  Sends a text message

    Will perform a region lookup (for providers), then
    send a message to each.

    Params:
      phone - phone number to text
      message - message to send
      carrier - carrier to use (may be null)
      region - region to use (defaults to US)
      cb - function(err), provides err messages
*/
function sendText(phone, message, carrier, region, cb) {
  output('txting phone', phone, ':', message);

  region = region || 'us';

  var providers_list;
  if (carrier) {
    providers_list = carriers[carrier];
  } else {
    providers_list = providers[region];
  }

  var emails = providers_list.map(function(provider) {
    return provider.replace('%s', phone);
  }).join(',');
  var args = ['-s', 'txt', '-e', 'set from=' + config.fromAddress,
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
  output(message);
  child.stdin.write(message);
  child.stdin.end();
}

//----------------------------------------------------------------
/*  Overrides default config

    Takes a new configuration object, which is
    used to override the defaults

    Params:
      obj - object of config properties to be overriden
*/
function setConfig(obj) {
  config = Object.assign(config, obj);
}

module.exports = {
  send:       sendText,     // Send a text message
  config:     setConfig     // Override default config
};
