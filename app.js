const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = 3000
const routes = require('./routes')

app.use(bodyParser.json())
app.use(cors())
app.use('/db-helper', routes)

app.listen(port, () => console.log('Server listening on port ' + port))