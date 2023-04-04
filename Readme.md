# Sock - A Simple WebSocket Testing Tool
![Preview](/img/screen.png)

Sock is a terminal software that allows you to connect to a WebSocket, send and recieve data. It's simple by design and was created to provide an easy way to test WebSockets conversationally (ie. testing messaging frameworks).

## Installation
1. Clone Repository
2. Install Dependencies
3. See [Example Usage](#example-usage)

## Usage
```
node index.js --server ws://localhost:3001
```

## Options
- `--server` *required* tells Sock where to connect
- `--reconnect` *optional* will attempt to reconnect upon disconnection
- `--run` *optional* specify a file that contains automation commands (see [Automation](#automation))

## Automation
You can automate Sock using a JSON file that specifies messages to send to the server when certain events occur. Support for automation is very basic at the moment and allows you to automatically send messages on `open`, `message` and `unexpected-response` events in the WebSocket. Your specified commands will run *after* any internal handlers.

Here's a sample automation script that shows a basic use case:
```json
// auth.json
{
  "open": ["trigger-authentication"],
  "unexpected-response": ["what-does-that-mean"]
}
```

This sample would send `trigger-authentication` to the server when the socket is opened and `what-does-that-mean` when an `unexpected-response` event is triggered.