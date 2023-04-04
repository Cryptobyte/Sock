const ws = require('ws');
const fs = require('fs');
const arg = require('arg');
const colors = require('colors');
const readline = require('readline');
const colorize = require('json-colorizer');
const path = require('path');

const args = arg({
	'--server': String,
  '--reconnect': Boolean,
  '--run': String
});

if (!args['--server']) {
  console.log('Missing required parameter "--server <uri>"');
  process.exit(1);
}

const server = args['--server'];
const reconnect = args['--reconnect'];

console.user    = (data) => console.log(`${colors.white('<')} ${colors.blue(data)}`)
console.server  = (data) => console.log(`${colors.white('>')} ${colors.green(data)}`);
console.program = (data) => console.log(`${colors.white('~')} ${colors.gray(data)}`);

let wsc;
let buffer = '';
let reconnecting = false;

const runActions = (event) => {
  const filePath = path.join(__dirname, args['--run']);

  if (!fs.existsSync(filePath)) return;

  const file = require(filePath);

  if (!file[event]) return;

  for (const action of file[event]) {
    console.user(action);
    wsc.send(action);
  }
};

const connect = () => {
  wsc = new ws.WebSocket(server);
  
  wsc.on('open', () => {
    console.program(`Connected!`);
    reconnecting = false;

    if (args['--run']) {
      runActions('open');
    }
  });
  
  wsc.on('close', (code, reason) => {
    if (!reconnecting) {
      console.program(`Connection has been closed! ${reason.toString() || 'Unknown Reason'} [${code}]`);
    }

    if (reconnect) {
      reconnecting = true;
      connect();
    }
  });
  
  wsc.on('error', (err) => {
    if (!reconnecting) {
      console.program(`Connection error has occured!`, err);
    }
  });
  
  wsc.on('message', (data, _) => {
    const string = data.toString();
    
    let json;
    try {
      json = JSON.parse(string);
  
    } catch { }
  
    if (json) {
      console.server('JSON');
      console.log(colorize(JSON.stringify(json, null, 2)));
  
    } else {
      console.server(string);
    }

    if (args['--run']) {
      runActions('message');
    }
  });
  
  wsc.on('unexpected-response', (req, res) => {
    console.program(`Connection has given an unexpected response!`);

    if (args['--run']) {
      runActions('unexpected-response');
    }
  });
};

console.program(`Connecting to ${server} ..`);
connect();

readline.emitKeypressEvents(process.stdin);

process.stdin.on('keypress', function(chunk, key) {
  buffer += chunk;

  if (key && key.name == 'return') {
    process.stdout.write(`\r${colors.white('<')} ${colors.blue(buffer)}\n`);
    wsc.send(buffer);
    buffer = '';
  }

  if (key && key.ctrl && key.name == 'c') {
    wsc.close();

    console.program('Bye!');
    process.exit(0);
  }

  if (key.name == 'backspace') {
    buffer = buffer.slice(0, buffer.length - 2);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(buffer);
    return;
  }

  process.stdout.write(chunk);
});

process.stdin.setRawMode(true);
process.stdin.resume();