const express = require('express');
const { report } = require('../controllers/ReportController')

const router = express.Router();

router.post('/', report)

module.exports = router;