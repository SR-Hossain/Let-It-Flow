const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'srhossain',
  password: 'srhossain',
  database: 'let_it_flow'
});

// Connect to the database
db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL database');
});

// Export the database connection
module.exports = db;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));


//getQuesions function
app.get('/getQuestions', (req, res) => {
  db.query('SELECT * FROM posts where root_post is NULL', (err, results) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ error: 'Error fetching posts' });
    }

    return res.status(200).json(results);
  });
});

app.get('/getReplies=:postId', (req, res) => {
  const postId = req.params.postId;
  db.query(`SELECT *, DATE_FORMAT(post_created, '%h:%i:%s%p, %d %b %Y') AS formatted_time FROM posts WHERE root_post=${postId} ORDER BY post_created DESC`, (err, results) => {
    if(err){
      return res.status(500).json({error: 'Error fetching posts'});

    }
    return res.status(200).json(results);
  });
});

app.get('/getPost=:postId', (req, res) => {
  const postId = req.params.postId;
  db.query('select * from posts where post_id='+postId, (err, results) => {
    if(err){
      return res.status(500).json({error: 'Error fetching posts'});

    }
    return res.status(200).json(results);
  });
});

// Serve index.html when accessing the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/:postId', (req, res) => {
  const postId = req.params.postId; // Get the postId from the URL
  // Fetch the post from the database using postId
  // Render the post details page
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  // res.send(`Displaying post ${postId}`);
});

app.listen(port, () => {
  console.log('Server started at ' + port);
});
