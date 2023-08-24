const express = require('express');
const router = express.Router();
const db = require('./server');

router.post('/register', (req, res) => {
    const { username, password } = req.body;

});

module.exports = router;
