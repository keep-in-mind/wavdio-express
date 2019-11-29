const express = require('express')

const server = express()

const port = 3000

server.get('/hello', (request, response) => response.send('Hello world!'))

server.listen(port, () => console.log(`Server listening on port ${port}`))
