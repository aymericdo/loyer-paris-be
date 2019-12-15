const express = require('express')
const router = express.Router()
const migration1 = require('./migrations/1')

// routes
router.post('/', runMigrations)

function runMigrations(req, res, next) {
    migration1()
    res.json('done')
}

module.exports = router
