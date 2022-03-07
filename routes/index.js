const express = require('express')
const queryParser = require('../controllers/query-parser')

const router = express.Router()

router.post('/select', queryParser.parseSelect)
router.post('/insert', queryParser.parseInsert)
router.post('/update', queryParser.parseUpdate)
router.post('/delete', queryParser.parseDelete)

module.exports = router