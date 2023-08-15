const db = require('./server');
// Query example: Select all posts
db.query('SELECT * FROM users', (err, results) => {
  if (err)
    throw err;

  console.log(results);
});

// Close the connection when done
db.end();
