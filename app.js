const http = require('http')

http
  .createServer(function (res, res) {
    res.write('i love hating math!!')
    res.end()
  })
  .listen(3000)

console.log('server listening on port 3000')
console.log('yahoooooo!')
