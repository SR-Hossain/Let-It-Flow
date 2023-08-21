const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;



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


passport.use(new LocalStrategy(
  (username, password, done) => {
    // Validate the user's credentials
    // Call done() with user object if authentication succeeds
    // Call done(null, false) if authentication fails
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Fetch user details from database using id
  done(null, user);
});


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


app.get('/getResults', (req, res) => {

  const searchQuery = req.query.q;
  const searchWords = searchQuery.split(' ');

  // Generate placeholders for the search words
  const placeholders = searchWords.map(() => '?').join(', ');

  // Construct the WHERE clause to search for each word
  const whereClause = '(' + searchWords.map(word => `(post LIKE '%${word}%')+(user_id like '${word}%')`).join(' + ')  + ')';

  const queryParams = searchWords.map(word => `%${word}%`);

  // Use the WHERE clause and placeholders in the query
  const query = `SELECT unique *, ${whereClause} AS match_count FROM posts WHERE ${whereClause} ORDER BY match_count DESC`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching similar posts:', err);
      return res.status(500).json({ error: 'Error fetching similar posts' });
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

app.get('/getHowManyVote=:postId', (req, res) => {
  const postId = req.params.postId;
  db.query(`select vote, (select count(root_post) from posts where root_post=${postId}) as comments from posts where post_id=${postId}`, (err, results)=> {
      if(err){
        return res.status(500).json({error: 'Error fetching posts'});
      }
      return res.status(200).json({ voteCount: results[0].vote, commentCount: results[0].comments });
    });
});

// Define a route for handling votes
app.get('/vote', (req, res) => {
  const postId = req.query.postId;
  const voteType = req.query.voteType;

  // Validate voteType to ensure it's either 'upvote' or 'downvote'
  if (voteType !== 'upvote' && voteType !== 'downvote') {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  // Use prepared statements and parameter binding to prevent SQL injection
  const sql = `UPDATE posts SET vote = CASE
    WHEN ? = 'upvote' THEN vote + 1
    WHEN ? = 'downvote' THEN vote - 1
  END
  WHERE post_id = ?`;

  db.query(sql, [voteType, voteType, postId], (err, result) => {
    if (err) {
      console.error('Error updating vote:', err);
      return res.status(500).json({error: 'Error fetching posts'});
    }
  });
  db.query(`select vote from posts where post_id=${postId}`, (err, results)=> {
      if(err){
        return res.status(500).json({error: 'Error fetching posts'});
      }
      return res.status(200).json({ voteCount: results[0].vote });
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



app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});


app.listen(port, () => {
  console.log('Server started at ' + port);
});
