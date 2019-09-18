const express = require('express')
const app = express()
const cors = require('cors');

const port = 3000

app.use(cors());

app.use('/seloger', require('./seloger/seloger.controller'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))