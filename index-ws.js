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

// handle shutdown gracefully ... use a process listener to catch any SIGINT command (ctrl-c) to shutdown the server gracefully and make sure we close the db and log what we want (from our shutdownDB function)
process.on('SIGINT', () => {
  console.log('sigint')
  // must close down each websocket connection or server won't close
  wss.clients.forEach(function closeEach(client) {
    client.close()
  })
  server.close(() => {
    shutdownDB()
  })
})

// if stuck in a runnng process, 'pkill node'

//  websocket states - open, closed, erroreduse listeners to handle these states
wss.on('connection', function connection(ws) {
  // log when someone connects
  const numClients = wss.clients.size
  console.log(
    `${new Date().toISOString()} :: client connected... number of clients: ${numClients}`
  )

  // broadcast will send a command to everyone connected
  wss.broadcast(`Current visitors: ${numClients}`)

  if (ws.readyState === ws.OPEN) {
    ws.send('welcome to the websocket server!!')
  }

  // insert into db everytime someone connects
  db.run(`INSERT INTO visitors (count, time)
          VALUES (${numClients}, datetime('now'))`)

  ws.on('close', function close() {
    wss.broadcast(`Current visitors: ${numClients}`)
    console.log(`client disconnected... number of clients: ${numClients}`)
  })
})

// write our own function instead of iterating over clients each time we want to broadcast
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data)
  })
}

/************* END WEBSOCKETS *************/

/************* BEGIN DATABASE *************/

const sqlite = require('sqlite3')

// can write to a file or to memory
// const db = new sqlite.Database('./myDb.db',)

// in this case, we're writing to memory, though DB WILL BE WIPED WHEN WE RESTART THE SERVER
const db = new sqlite.Database(':memory:')

// set tables everytime the server starts
db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER, 
      time TEXT
      )
    `)
})

function getCounts() {
  db.each('SELECT * FROM visitors', (err, row) => {
    console.log(row)
  })
}

// must close db connection when server is closed
function shutdownDB() {
  console.log('Shutting down db')

  getCounts()
  db.close()
}
