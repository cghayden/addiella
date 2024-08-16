const express = require('express')

const server = require('http').createServer()
const app = express()

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname })
  // res.sendFile(__dirname + '/index.html')
})

server.on('request', app)
server.listen(3000, () => {
  console.log('server listening on port 3000')
})

/** BEGIN WEBSOCKETS **/

const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ server: server }) // this is the server we created above - attach the websocket to our express server

//  websocket states - open, closed, erroreduse listeners to handle these states
wss.on('connection', function connection(ws) {
  // log when someone connects
  const numClients = wss.clients.size
  console.log('client connected', numClients)

  // broadcast will sned a command to everyone connected
  wss.broadcast(`Current visitors: ${numClients}`)

  if (ws.readyState === ws.OPEN) {
    ws.send('welcome to the websocket server!!')
  }
  ws.on('close', function close() {
    wss.broadcast(`Current visitors: ${numClients}`)
    console.log('client disconnected')
  })
})

// write our own function instead of iterating over clients each time we want to broadcast
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data)
  })
}
