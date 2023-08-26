const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
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
      return res.status(500).json({ error: 'Failed to authenticate token' });
    }

    req.user = decoded;
    next();
  });
};



app.post('/getUsername', authenticateUser, (req, res) => {
  const username = req.user.username;
  db.query(`select anonymous from users where user_id=?`, username, (err, results)=>{
    if(err)return res.status(500).json({error: 'kisu ekta error hoise'});
    if(results[0].anonymous===0)return res.status(200).json({user_id: username});
    return res.status(200).json({user_id: 'Anonymous'});
  });

});


app.post('/postSubmit', authenticateUser, (req, res) => {
  const username = req.user.username;
  const text = req.body.txt;
  const root_post = req.body.root_post;
  const query1 = `select anonymous from users where user_id='${username}'`;
  const query2 = `
  WITH RECURSIVE NumberSequence AS (
    SELECT 1 AS num
    UNION ALL
    SELECT num + 1
    FROM NumberSequence
  )
  SELECT num AS first_missing_post_id
  FROM NumberSequence
  WHERE NOT EXISTS (
    SELECT 1
    FROM posts
    WHERE post_id = NumberSequence.num
  )
  LIMIT 1;
  `;
  db.query(query1, (err, results)=>{
    if(err)return res.status(500).json({error: 'kisu ekta error hoise'});
    let anonymous = 0;
    if (results[0].anonymous===1)anonymous = 1;
    db.query(query2, (err, results)=>{
      if(err)return res.status(500).json({error: 'query2 te ashe nai'});
      const postId = results[0].first_missing_post_id;
      console.log('query2 hoise '+postId);
      const query3 = `insert into posts(root_post, user_id, post_id, anonymous, post) values(${root_post},'${username}', ${postId}, ${anonymous}, ?)`;

        console.log(query3);
      db.query(query3, text, (err, results)=>{
        if(err)if(err)return res.status(500).json({error: 'query3 te ashe nai'});
        return res.status(200).json({postId: postId});
      })
    })
  });

});




app.post('/toggleAnonymous', authenticateUser, (req, res)=>{
  const userId = req.user.username;
  const command = `
  update users
  set anonymous = not anonymous
  where user_id='${userId}'
  and role='General'
  `;
  db.query(command, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts that are reacted'});
    return res.status(200).json(results);
  })
});

app.post('/showMyPosts', authenticateUser, (req, res)=>{
  const userId = req.user.username;
  const command = `
  select * from posts
  where user_id='${userId}';
  `;
  db.query(command, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts that are reacted'});
    return res.status(200).json(results);
  })
});



//getQuesions function
app.get('/getQuestions', (req, res) => {
  const query = `
  SELECT post_id, post, role, root_post, DATE_FORMAT(post_created, '%h:%i:%s%p, %d %b %Y') as post_created,
       CASE WHEN anonymous = 1 THEN 'Anonymous' ELSE user_id END AS user_id
  FROM posts natural join users
  WHERE root_post is null;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ error: 'Error fetching posts' });
    }
    return res.status(200).json(results);
  });
});


app.get('/getResults', (req, res) => {

  const searchQuery = req.query.q;
  let postIdNum = 0;
  try{
    postIdNum = parseInt(searchQuery);
  }catch(error){}
  if(!postIdNum)postIdNum=0;
  const searchWords = searchQuery.split(' ');

  // Generate placeholders for the search words
  const placeholders = searchWords.map(() => '?').join(', ');

  // Construct the WHERE clause to search for each word
  const whereClause = '(' + searchWords.map(word => `(post LIKE '%${word}%')+(user_id like '${word}%')`).join(' + ')  + ')';

  const queryParams = searchWords.map(word => `%${word}%`);

  // Use the WHERE clause and placeholders in the query
  const query = `SELECT unique
  post_id, post, role, root_post, DATE_FORMAT(post_created, '%h:%i:%s%p, %d %b %Y') as post_created,
       CASE WHEN anonymous = 1 THEN 'Anonymous' ELSE user_id END AS user_id,
        ${whereClause} AS match_count FROM posts natural join users WHERE ${whereClause} or post_id=${postIdNum} or post_id div 10=${postIdNum} or post_id div 100=${postIdNum} or post_id div 1000=${postIdNum} or post_id div 10000=${postIdNum} ORDER BY match_count DESC`;

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
  const query = `
  SELECT post_id, post, role, root_post, DATE_FORMAT(post_created, '%h:%i:%s%p, %d %b %Y') as post_created,
        CASE WHEN anonymous = 1 THEN 'Anonymous' ELSE user_id END AS user_id,
        (select coalesce(sum(reactions.vote),0) from reactions natural join users where posts.post_id=reactions.post_id) as votes
  FROM posts natural join users
  WHERE root_post=${postId}
  ORDER BY votes desc, post_created DESC;
  `;
  db.query(query, (err, results) => {
    if(err){
      return res.status(500).json({error: 'Error fetching posts'});

    }
    return res.status(200).json(results);
  });
});
app.get('/getPost=:postId', (req, res) => {
  const postId = req.params.postId;
  const query = `
  SELECT post_id, role, post, root_post, DATE_FORMAT(post_created, '%h:%i:%s%p, %d %b %Y') as post_created,
       CASE WHEN anonymous = 1 THEN 'Anonymous' ELSE user_id END AS user_id
  FROM posts natural join users
  WHERE post_id = ${postId};
  `;
  console.log(query);
  db.query(query, (err, results) => {
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
app.post('/showMyInbox', authenticateUser, (req, res)=>{
  const username = req.user.username;
  const query = `
    SELECT *
    FROM (
        SELECT users, MAX(msg_sent_time) AS msg_sent_time
        FROM (
            SELECT receiver AS users, msg_sent_time, message
            FROM inbox
            WHERE sender = '${username}'
            UNION
            SELECT sender AS users, msg_sent_time, message
            FROM inbox
            WHERE receiver = '${username}'
        ) subquery
        GROUP BY users
    ) recent_time
    NATURAL JOIN inbox
    ORDER BY msg_sent_time DESC;
  `;
  db.query(query, (err, results)=>{
    if(err)return res.status(500).json({error: 'error hoise'});
    return res.status(200).json(results);
  });
});
app.post('/showChat', authenticateUser, (req, res)=>{

});



app.listen(port, () => {
  console.log('Server started at ' + port);
});
























const allowedIPs = ['127.0.0.1', '::1'];
const admin_app = express();
admin_app.use(express.json());
const allowOnlyAllowedIPs = (req, res, next) => {
  const clientIP = req.connection.remoteAddress;
  if (!allowedIPs.includes(clientIP)) {
    console.log(clientIP);
    return res.status(403).json({ error: 'Access forbidden from this IP' });
  }
  next();
};
admin_app.use(allowOnlyAllowedIPs);
admin_app.use(bodyParser.urlencoded({ extended: false }));
admin_app.use(bodyParser.json());
const port2 = 4000;
admin_app.use(express.static(path.join(__dirname, 'admin')));
admin_app.listen(port2, () => {
  console.log('Server started at ' + port2);
});

admin_app.post('/admin_login', (req, res) => {
    const password = req.body.password;
    const username = 'Admin^$&*@&$&@G@$&*#@';

    db.query(`select password from users where user_id=?`, username, (err, results)=>{
      if(err)return  res.status(500).json({error: 'Error!!!'});
      const hashedPass = results[0].password;
      const isPasswordValid = bcrypt.compare(password, hashedPass);
      if (!isPasswordValid) return res.status(401).json({ message: 'Authentication failed' });
      const token = jwt.sign({ username: username }, jwtSecretKey, {expiresIn: '1h'});
      return res.json({ token, message: 'Login successful' });
    });
});
admin_app.post('/isItAdmin', authenticateUser, (req, res) => {
  return res.status(200).json({message: 'Login successful'});
});
admin_app.get('/searchUsers', (req, res) => {
  const searchQuery = req.query.q;
  const role = req.query.role;
  let condition = '';
  if(role!='All')condition = `and role='${role}'`;
  db.query(`select user_id, role from users where user_id like '%${searchQuery}%' and role!='Admin' ${condition}`, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts that are reacted'});
    return res.status(200).json(results);
  });
});
admin_app.post('/userRoleUpdate', authenticateUser, (req, res)=>{
  const username = req.body.username;
  const newRole = req.body.newRole;
  const command = `
    update users set role='${newRole}' where user_id='${username}' and role!='Admin'
  `;
  db.query(command, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts'});
    return res.status(200).json({ message: 'success' });
  })
});
admin_app.post('/removeUser', authenticateUser, (req, res)=>{
  const username = req.body.username;
  const command = `
    delete from users where user_id='${username}' and role!='Admin'
  `;
  db.query(command, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts'});
    return res.status(200).json({ message: 'success' });
  })
});
admin_app.post('/removePost', authenticateUser, (req, res)=>{
  const postId = req.body.postId;
  const command = `
    delete from posts where post_id=${postId}
  `;
  db.query(command, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts'});
    return res.status(200).json({ message: 'success' });
  })
});
admin_app.get('/searchPosts', (req, res) => {
  const searchQuery = req.query.q;
  let postIdNum = 0;
  try{
    postIdNum = parseInt(searchQuery);
  }catch(error){}
  if(!postIdNum)postIdNum=0;
  const searchWords = searchQuery.split(' ');
  const placeholders = searchWords.map(() => '?').join(', ');
  const whereClause = '(' + searchWords.map(word => `(post LIKE '%${word}%')+(user_id like '${word}%')`).join(' + ')  + ')';

  const queryParams = searchWords.map(word => `%${word}%`);
  const query = `SELECT unique
  post_id, post, role, root_post, DATE_FORMAT(post_created, '%h:%i:%s%p, %d %b %Y') as post_created,
       CASE WHEN anonymous = 1 THEN 'Anonymous' ELSE user_id END AS user_id,
        ${whereClause} AS match_count FROM posts natural join users WHERE ${whereClause} or post_id=${postIdNum} or post_id div 10=${postIdNum} or post_id div 100=${postIdNum} or post_id div 1000=${postIdNum} or post_id div 10000=${postIdNum} ORDER BY match_count DESC`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching similar posts:', err);
      return res.status(500).json({ error: 'Error fetching similar posts' });
    }

    return res.status(200).json(results);
  });
});





























const moderator_app = express();
moderator_app.use(express.json());
moderator_app.use(bodyParser.urlencoded({ extended: false }));
moderator_app.use(bodyParser.json());
const port3 = 5000;
moderator_app.use(express.static(path.join(__dirname, 'moderator')));
moderator_app.listen(port3, () => {
  console.log('Moderator Server started at ' + port3);
});

moderator_app.post('/admin_login', (req, res) => {
    const password = req.body.password;
    const username = req.body.username;

    db.query(`select password from users where user_id=?`, username, (err, results)=>{
      if(err)return  res.status(500).json({error: 'Error!!!'});
      const hashedPass = results[0].password;
      const isPasswordValid = bcrypt.compare(password, hashedPass);
      if (!isPasswordValid) return res.status(401).json({ message: 'Authentication failed' });
      const token = jwt.sign({ username: username }, jwtSecretKey, {expiresIn: '1h'});
      return res.json({ token, message: 'Login successful' });
    });
});
moderator_app.post('/isItAdmin', authenticateUser, (req, res) => {
  return res.status(200).json({message: 'Login successful'});
});
moderator_app.get('/searchUsers', (req, res) => {
  const searchQuery = req.query.q;
  const role = req.query.role;
  let condition = '';
  if(role!='All')condition = `and role='${role}'`;
  db.query(`select user_id, role from users where user_id like '%${searchQuery}%' and role!='Admin' and role!='Moderator' ${condition}`, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts that are reacted'});
    return res.status(200).json(results);
  });
});
moderator_app.post('/userRoleUpdate', authenticateUser, (req, res)=>{
  const username = req.body.username;
  const newRole = req.body.newRole;
  const command = `
    update users set role='${newRole}' where user_id='${username}' and role!='Admin' and role!='Moderator'
  `;
  db.query(command, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts'});
    return res.status(200).json({ message: 'success' });
  })
});
moderator_app.post('/removeUser', authenticateUser, (req, res)=>{
  const username = req.body.username;
  const command = `
    delete from users where user_id='${username}' and role!='Admin' and role!='Moderator'
  `;
  db.query(command, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts'});
    return res.status(200).json({ message: 'success' });
  })
});
moderator_app.post('/removePost', authenticateUser, (req, res)=>{
  const postId = req.body.postId;
  const command = `
    delete from posts natural join users where post_id=${postId} and role!='Admin' and role!='Moderator'
  `;
  db.query(command, (err, results)=>{
    if(err)return res.status(500).json({error: 'Error fetching posts'});
    return res.status(200).json({ message: 'success' });
  })
});
moderator_app.get('/searchPosts', (req, res) => {
  const searchQuery = req.query.q;
  let postIdNum = 0;
  try{
    postIdNum = parseInt(searchQuery);
  }catch(error){}
  if(!postIdNum)postIdNum=0;
  const searchWords = searchQuery.split(' ');
  const placeholders = searchWords.map(() => '?').join(', ');
  const whereClause = '(' + searchWords.map(word => `(post LIKE '%${word}%')+(user_id like '${word}%')`).join(' + ')  + ')';

  const queryParams = searchWords.map(word => `%${word}%`);
  const query = `SELECT unique
  post_id, post, role, root_post, DATE_FORMAT(post_created, '%h:%i:%s%p, %d %b %Y') as post_created,
       CASE WHEN anonymous = 1 THEN 'Anonymous' ELSE user_id END AS user_id,
        ${whereClause} AS match_count FROM posts natural join users WHERE role!='Admin' and role!='Moderator' and (${whereClause} or post_id=${postIdNum} or post_id div 10=${postIdNum} or post_id div 100=${postIdNum} or post_id div 1000=${postIdNum} or post_id div 10000=${postIdNum}) ORDER BY match_count DESC`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching similar posts:', err);
      return res.status(500).json({ error: 'Error fetching similar posts' });
    }

    return res.status(200).json(results);
  });
});
