# Sock - A Simple WebSocket Testing Tool
![Preview](/img/screen.png)

Sock is a terminal software that allows you to connect to a WebSocket, send and recieve data. It's simple by design and was created to provide an easy way to test WebSockets conversationally (ie. testing messaging frameworks).

## Installation
1. Clone Repository
2. Install Dependencies
3. See [Example Usage](#example-usage)

## Example Usage
```
node index.js --server ws://localhost:3001
```

## Using Binaries
```
sudo cp bin/sock /usr/local/bin/sock
sock --server ws://localhost:3001
```