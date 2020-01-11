const express = require('express')
const router = express.Router()
// import { migration1 } from './migrations/1'

// routes
router.post('/', runMigrations)

function runMigrations(req, res, next) {
    // migration1()
    res.json('done')
}

module.exports = router
