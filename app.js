const http = require('http')

http
  .createServer(function (res, res) {
    res.write('handrolling my own server with local updates!')
    res.end()
  })
  .listen(3000)

console.log('server listening on port 3000')
console.log('yahoooooo!')
