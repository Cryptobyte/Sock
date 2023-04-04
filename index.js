const ws = require('ws');
const arg = require('arg');
const colors = require('colors');
const readline = require('readline');
const colorize = require('json-colorizer');

const args = arg({
	'--server': String
});

if (!args['--server']) {
  console.log('Missing required parameter "--server <uri>"');
  process.exit(1);
}

const server = args['--server'];

console.user    = (data) => console.log(`${colors.white('<')} ${colors.blue(data)}`)
console.server  = (data) => console.log(`${colors.white('>')} ${colors.green(data)}`);
console.program = (data) => console.log(`${colors.white('~')} ${colors.gray(data)}`);

let buffer = '';

console.program(`Connecting to ${server} ..`);
const wsc = new ws.WebSocket(server);

wsc.on('open', () => {
  console.program(`Connected!`);
});

wsc.on('close', (code, reason) => {
  console.program(`Connection has been closed!`);
  console.program(`${code} ${reason.toString() || 'Unknown Reason'}`);
  process.exit(1);
});

wsc.on('error', (err) => {
  console.program(`Connection error has occured!`, err);
});

wsc.on('message', (data, _) => {
  const string = data.toString();
  
  let json;
  try {
    json = JSON.parse(string);

  } catch { }

  if (json) {
    console.server('Server Message:');
    console.log(colorize(JSON.stringify(json, null, 2)));

  } else {
    console.server(string);
  }
});

wsc.on('unexpected-response', (req, res) => {
  console.program(`Connection has given an unexpected response!`);
});

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