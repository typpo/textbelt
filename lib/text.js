const { StringDecoder } = require('string_decoder');
const { spawn } = require('child_process');

const carriers = require('./carriers.js');
const providers = require('./providers.js');


let config = require('./config.js');

//----------------------------------------------------------------
/*
    General purpose logging function, gated by a configurable
    value.
*/
function output(...args) {
  if (config.debugEnabled) {
    // eslint-disable-next-line no-console
    console.log.apply(this, args);
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

  let providersList;
  if (carrier) {
    providersList = carriers[carrier];
  } else {
    providersList = providers[region || 'us'];
  }

  const emails = providersList.map(provider => provider.replace('%s', phone)).join(',');
  const args = ['-s', 'txt', '-e', `set from=${config.fromAddress}`,
    '-e', 'set use_from=yes', '-e', 'set envelope_from=yes', '-b', emails];
  const child = spawn('mutt', args);
  const decoder = new StringDecoder('utf8');
  child.stdout.on('data', (data) => {
    output(decoder.write(data));
  });
  child.stderr.on('data', (data) => {
    output(decoder.write(data));
  });
  child.on('error', (data) => {
    output('mutt failed', { email: emails, data: decoder.write(data) });
    cb(false);
  });
  child.on('exit', () => {
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
  send: sendText, // Send a text message
  config: setConfig, // Override default config
};
