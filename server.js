const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const salt = '$2b$10$ZXcDtjTdm3Wf4.tQJRaJjO';


const app = express();
const port = 3000;
// Your JWT secret key
const jwtSecretKey = 'f4.tQJRaJjOzI5DqYZ6.guqqKFw14fVjYvXvU1CjGS';


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

// Middleware to verify JWT token and check authentication
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, jwtSecretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    req.user = decoded;
    next();
  });
};



app.post('/getUsername', authenticateUser, (req, res) => {
  const username = req.user.username;
  db.query(`select role from users where user_id=?`, username, (err, results)=>{
    if(err)return res.status(500).json({error: 'kisu ekta error hoise'});
    if(results[0].role)return res.status(200).json({user_id: username});
    return res.status(200).json({user_id: 'Anonymous'});
  });

});



app.post('/toggleAnonymous', authenticateUser, (req, res)=>{
  const userId = req.user.username;
  const command = `
  update users
  set role=case
  when role='anonymous' then null
  else 'anonymous'
  end
  where user_id='${userId}';
  `;
  db.query(command, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts that are reacted'});
    return res.status(200).json(results);
  })
});


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
  const query = `
    select
    (select count(root_post) from posts where root_post=${postId}) as comments,
    COALESCE((select sum(vote) from reactions where post_id=${postId}),0) as vote
    from posts where post_id=${postId};
  `;
  db.query(query, (err, results)=> {
      if(err){
        return res.status(500).json({error: 'Error fetching posts'});
      }
      return res.status(200).json({ voteCount: results[0].vote, commentCount: results[0].comments });
    });
});






app.post('/setReaction', authenticateUser, (req, res)=>{
  const userId = req.user.username;
  const postId = req.body.postId;
  const vote = req.body.voteType;
  const command = `
  INSERT INTO reactions (user_id, post_id, vote)
  VALUES ('${userId}', ${postId}, ${vote})
  ON DUPLICATE KEY UPDATE vote = CASE
    WHEN vote = ${vote} THEN 0
    ELSE ${vote}
  END;
  `;
  db.query(command, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts'});
    db.query('delete from reactions where vote=0');
    db.query('select coalesce(sum(vote),0) as vote from reactions where post_id=?', postId, (err, results)=>{
        if(err)return res.status(500).json({error: 'Error fetching posts'});
        const voteCount = results[0].vote;
        db.query(`select sum(vote) as userReaction from reactions where user_id=? and post_id=?`, [userId, postId], (err, results)=>{
          const userReaction = results[0].userReaction;
          return res.status(200).json({ voteCount: voteCount, userReaction: userReaction });
        })
    });
  })
});


app.post('/getPostWhereCurrentUserReactionExists', authenticateUser, (req, res)=>{
  const userId = req.user.username;
  const command = `select post_id, vote from reactions where user_id='${userId}'`;
  console.log(command);
  db.query(command, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts that are reacted'});
    return res.status(200).json(results);
  })
});





// Serve index.html when accessing the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/:postId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



// Handling the /login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username) return res.status(401).json({ message: 'Authentication failed' });

    db.query(`select password from users where user_id=?`, username, (err, results)=>{
      if(err)return  res.status(500).json({error: 'Error!!!'});
      const hashedPass = results[0].password;
      const isPasswordValid = bcrypt.compare(password, hashedPass);
      if (!isPasswordValid) return res.status(401).json({ message: 'Authentication failed' });
      const token = jwt.sign({ username: username }, jwtSecretKey, {expiresIn: '1h'});
      console.log(token);
      return res.json({ token, message: 'Login successful' });
    });
});


// Handling the /signup route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username) return res.status(401).json({ message: 'Authentication failed' });

    const hashedPass = await bcrypt.hash(password, salt);

    db.query(`insert into users(user_id, password) values(?, ?)`, [username, password], (err, results)=>{
      if(err)return res.status(409).json({ error: err.sqlMessage });
      db.query(`update users set password=? where user_id=?`, [hashedPass, username]);
      return res.status(200).json(results);
    });
});



app.listen(port, () => {
  console.log('Server started at ' + port);
});




