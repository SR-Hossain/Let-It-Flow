const express = require('express');
const router = express.Router();
const db = require('../server'); // Correct the path to server.js

router.get('/getQuestions', (req, res) => {
  db.query('SELECT * FROM posts where root_post is NULL', (err, results) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ error: 'Error fetching posts' });
    }

    return res.status(200).json(results);
  });
});

module.exports = router;
