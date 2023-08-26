const questionsContainer = document.querySelector('.questions');
let postId = window.location.pathname.substr(1); // Extract postId from the URL
const topQuestionPanel = document.querySelector('.topQuestionPanel');
const repliesContainer = document.querySelector('.replies');
const commentBox = document.querySelector('.comment-box');
const rightPanel = document.querySelector('.right-panel');
const leftPanel = document.querySelector('.left-panel');
const header = document.querySelector('.header');
const inputSearch = document.querySelector('.search-box-click');
const faArrowLeft = document.querySelector('.fa-arrow-left');
const faBars = document.querySelector('.fa-bars');
const dragbar = document.querySelector('.drag-bar');
const left = document.querySelector('.left-panel');
const right= document.querySelector('.right-panel');
const searchBar = document.querySelector('.search-box');
let flag = false;
let initialOffsetX = 0;
const screenWidth = window.innerWidth;
let newLeftWidth = left.style.width;
let msgPortal = document.createElement('div');
  const md = new MobileDetect(window.navigator.userAgent);

msgPortal.innerHTML = `

`;
let anonymousButton = document.createElement('div');
anonymousButton.innerHTML = `
<input class="pristine" type="checkbox" name="toggle" value="on">
`;

const white_tick = `<i class="fa fa-check" style="font-size:48px;color:white"></i>`;


document.addEventListener('DOMContentLoaded', () => {

    showQuestionsInLeftPanel();
    searchInputListener();
    refreshRightPanel();

    inputSearch.addEventListener('focus', () => {
        header.classList.add('focus');
    });

    faArrowLeft.addEventListener('click', () => {
        header.classList.remove('focus');
        searchBar.style.display = 'flex';
        showQuestionsInLeftPanel();
    });

    faBars.addEventListener('click', ()=>{
        header.classList.add('focus');
        searchBar.style.display = 'None';
        navToolBar();
    });

    deviceAdjust();
});

function isIntegerString(input) {
  // Use a regular expression to match only digits
  return /^\d+$/.test(input);
}

function refreshRightPanel(){
      if(isIntegerString(postId)){
      rightPanel.style.display = 'flex';
      rightPanel.style.flex = '1';
      }
      rightPanelTopBar();
    rightPanelGetReplies();
    deviceAdjust();

}

function deviceAdjust(){
  const allElements = document.querySelectorAll('.header');

  if (!md.mobile()) {
    disableMobileStylesheet();
  }
  else{
    if(isIntegerString(postId)){
      rightPanel.style.display = 'flex';
      rightPanel.style.flex = '1';
      leftPanel.style.display = 'None';
      }
    allElements.forEach(element => {
      element.style.fontSize = '20px';
    });
  }
}

function disableMobileStylesheet() {
  var links = document.head.getElementsByTagName('link');
  for (var i = 0; i < links.length; i++) {
    if (links[i].href.includes('mobile-version.css')) {
      links[i].parentNode.removeChild(links[i]);
      break;
    }
  }
}



function sendTo(url) {
  window.location.href = url;
}


function login(){
  if(md.mobile()){
    rightPanel.style.display="none";
    leftPanel.style.display='flex';
    leftPanel.style.flex = '1';
    leftPanel.style.width = '100vw';
  }
  questionsContainer.innerHTML = `
        <section class="forms-section">
        <div class="forms">
          <div class="form-wrapper is-active">
            <button type="button" class="switcher switcher-login">
              Login
              <span class="underline"></span>
            </button>
            <form class="form btn form-login">
              <fieldset>
                <legend>Please, enter your email and password for login.</legend>
                <div class="input-block">
                  <label for="username">Username</label>
                  <input id="input-username" class="input-username" type="text" required>
                </div>
                <div class="input-block">
                  <label for="login-password">Password</label>
                  <input id="login-password" type="password" class="input-password" required>
                </div>
              </fieldset>
              <button id="loginButton" class="btn-login" type="loginButton" onclick="event.preventDefault()">Login</button>
            </form>
          </div>
          <div class="form-wrapper">
            <button type="button" class="switcher switcher-signup">
              Sign Up
              <span class="underline"></span>
            </button>
            <form class="form btn form-signup">
              <fieldset>
                <legend>Please, enter your email, password and password confirmation for sign up.</legend>
                <div class="input-block">
                  <label for="username">Username</label>
                  <input id="signup-email" type="text" class="input-username" required>
                </div>
                <div class="input-block">
                  <label for="signup-password">Password</label>
                  <input id="signup-password" type="password" class="input-password" required>
                </div>
                <div class="input-block">
                  <label for="signup-password-confirm">Confirm password</label>
                  <input id="signup-password-confirm" type="password" required>
                </div>
              </fieldset>
              <button id="registerButton" type="loginButton" class="btn-signup" onclick="event.preventDefault()">Register</button>
              <div class="error">---<div>
            </form>
          </div>
        </div>
      </section>
  `;


    const switchers = questionsContainer.querySelectorAll('.switcher');

    switchers.forEach(item => {
        item.addEventListener('click', function() {
            switchers.forEach(item => item.parentElement.classList.remove('is-active'))
            this.parentElement.classList.add('is-active')
        })
    });



document.getElementById('loginButton').addEventListener('click', authentication);
document.getElementById('registerButton').addEventListener('click', register);

}

async function register(){
  const username = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const passwordConfirm = document.getElementById('signup-password-confirm').value;

  const errorDiv= document.querySelector('.error');
  if(password != passwordConfirm){
    errorDiv.textContent = 'Passwords do not match';
    return;
  }
  const signupData = { username, password };

  // Send a POST request to the /login route
  const response = await fetch('/signup', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json'
          },
          body: JSON.stringify(signupData)
  });

  const result = await response.json();

  if (response.ok) {
      document.querySelector('.switcher-login').click();
      document.getElementById('input-username').value = username;
      document.getElementById('login-password').value = password;
      document.getElementById('loginButton').click();
  } else if (result.error) {
      // Display the error message in the .error element
      if (result.error.includes('Duplicate entry'))errorDiv.textContent = `Username with '${username}' already exists. Choose another one!`;
      else errorDiv.textContent = result.error;
    }
}
// Existing code ...

// Define a function to handle login
function authentication() {
  const username = document.getElementById('input-username').value;
  const password = document.getElementById('login-password').value;
  // Send login data to the server for authentication
  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Login successful') {
      localStorage.setItem('authToken', data.token);
      searchBar.style.display = 'flex';
      header.classList.remove('focus');
      navToolBar();
    } else {
      alert('Login failed. Please check your credentials.');
    }
  })
  .catch(error => {
    console.error('Login error:', error);
  });
}


function logout(){
  localStorage.removeItem('authToken');
  searchBar.style.display = 'flex';
  header.classList.remove('focus');
  showQuestionsInLeftPanel();
}


function rightPanelTopBar(){
  fetch('/getPost='+postId)
    .then(response => response.json())
    .then(posts => {
      posts.forEach(post => {
        let rootPost = post.root_post;
        if (rootPost === null)rootPost = ' ';
        topQuestionPanel.innerHTML = `
          <button onclick="sendTo('/${rootPost}')" class="arrow_left">
            <i class="text fas fa-arrow-left"></i> <!-- Font Awesome left arrow icon -->
          </button>
          <div class="text selected_question btn post">
                <a class="text fake-link-long" href="/${post.post_id}">
                  <div class="text post text-post">${post.post}</div>
                </a>
                <div class="userandreaction">
              <div class="useruser">
              <button class="text btn user-id-short" onclick="showChatBoxInRightPanel('${post.user_id}')">
                ${post.user_id}
                <div class="text post-created">${post.post_created}</div>
                </div>
                <div class="all-reactions">

                  <p class="text replies-info"></p>

                  <button class="text upvote-btn small-btn btn postSequenceU${post.post_id}" onclick="handleVote(${post.post_id}, 1, this.nextElementSibling)"><i class="text fa fa-thumbs-up"></i></button>
                  <button class="text vote_count small-btn btn"></button> <!-- Corrected this line -->
                  <button class="text downvote-btn small-btn btn postSequenceD${post.post_id}" onclick="handleVote(${post.post_id}, -1, this.previousElementSibling)"><i class="text fa fa-thumbs-down"></i></button>
            </div>

            </div>
                </div>



          </div>
        `;
        updateVoteText(topQuestionPanel.querySelector('.vote_count'), topQuestionPanel.querySelector('.replies-info'), post.post_id);
        commentBox.innerHTML = `
            <span class="spacious">
              <textarea type="text" class="nobg"></textarea>
            </span>
            <button class="text comment-submit-btn">
              <i class="text fas fa-paper-plane"></i> <!-- Font Awesome paper plane icon -->
            </button>
          `;
        commentBox.querySelector('.comment-submit-btn').addEventListener('click', function(){
          newPostSubmit(postId, commentBox.querySelector('.nobg').value);
        });
      });
    })
    .catch(error => {
      leftPanel.style.flex = '1';
      leftPanel.style.display= 'flex';
      rightPanel.style.display = 'None';

      console.error('Error fetching posts:', error);
    });

}

function rightPanelGetReplies(){
      fetch('/getReplies='+postId)
    .then(response => response.json())
    .then(replies => {
        replies.forEach(reply => {
          const replyDiv = document.createElement('div');
          replyDiv.innerHTML = `
            <div class="text reply-section fake-link comments"" >

                <div class="text sender text-sender btn" onclick="showChatBoxInRightPanel('${reply.user_id}')">${reply.user_id} (${reply.role}) → ${reply.post_created}</div>
                <a href="/${reply.post_id}" class="text fake-link comments">
                <div class="text clickOnReplies">${reply.post}</div>
                </a>
                <div class="all-reactions">
                  <p class="text replies-info"></p>

                  <button class="text upvote-btn small-btn btn postSequenceU${reply.post_id}" onclick="handleVote(${reply.post_id}, 1, this.nextElementSibling)"><i class="text fa fa-thumbs-up"></i></button>
                  <button class="text vote_count small-btn btn"></button> <!-- Corrected this line -->
                  <button class="text downvote-btn small-btn btn postSequenceD${reply.post_id}" onclick="handleVote(${reply.post_id}, -1, this.previousElementSibling)"><i class="text fa fa-thumbs-down"></i></button>
                </div>
            </div>
          `;
          updateVoteText(replyDiv.querySelector('.vote_count'), replyDiv.querySelector('.replies-info'), reply.post_id);
          repliesContainer.appendChild(replyDiv);

        });
        colorReactedPost(repliesContainer);
    })
    .catch(error => {
      console.error('Error fetching replies:', error);
    });


}

function colorReactedPost(repliesContainer) {
  fetch('/getPostWhereCurrentUserReactionExists', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('authToken')
    }
  })
    .then(response => response.json())
    .then(result => {
      result.forEach(post => {
        console.log(post.vote, post.post_id, '.postSequenceU'+post.post_id);
        try{
          if(post.vote===1)repliesContainer.querySelector('.postSequenceU'+post.post_id).classList.add('selected_post');
          else repliesContainer.querySelector('.postSequenceD'+post.post_id).classList.add('selected_post');
          console.log(post.post_id+' '+post.vote);
        }catch(error){
          console.log(error+' ashlo na '+post.post_id);
        }
      })
    })
    .catch(error => {
      console.log('hoilo na');
      // Error handling
    });
}

function searchInputListener(){
      inputSearch.addEventListener('keyup', (event) => {
        const searchQuery = inputSearch.value;
        fetch('/getResults?q='+searchQuery)
          .then(response => response.json())
          .then(posts => {
            questionsContainer.innerHTML = '';
            posts.forEach(post => {
              const postDiv = document.createElement('div');
              postDiv.innerHTML = `
                <div class="text one_quesion">
                  <button class="text btn user-id" onclick="showChatBoxInRightPanel('${post.user_id}')">
                    ${post.user_id} (${post.role})
                    <div class="text post-created">${post.post_created}</div>
                  </button>
                    <button class="text btn post">
                      <a class="text fake-link" href="/${post.post_id}">
                        <div class="text post">${post.post}</div>
                      </a>
                    </button>
                </div>
              `;
              if(postId==post.post_id)postDiv.querySelector('.post').classList.add('selected_post');
              questionsContainer.appendChild(postDiv);
            });
          })
          .catch(error => {
            console.error('Error fetching posts:', error);
          });
      // }
    });
}


function showComments(postId, postText) {
  // Use the post object to decide which properties to use
  console.log('ashse eikhaneo');
  const selected_question = document.querySelector('.selected_question');
  selected_question.textContent = postText+' ';
}


function showQuestionsInLeftPanel(){
  fetch('/getQuestions')
    .then(response => response.json())
    .then(posts => {
      questionsContainer.innerHTML='';
      posts.forEach(post => {
        const postDiv = document.createElement('div');
        const post_msg = post.post.slice(0, 250);
        postDiv.innerHTML = `
          <div class="text one_quesion">
            <button class="text btn user-id" onclick="showChatBoxInRightPanel('${post.user_id}')">
              ${post.user_id} (${post.role})
              <div class="text post-created">${post.post_created}</div>
            </button>
              <button class="text btn post">
                <a class="text fake-link" href='/${post.post_id}')">
                  <div class="text post">${post_msg}...</div>
                </a>
              </button>
          </div>
        `;
        questionsContainer.appendChild(postDiv);
        if(postId==post.post_id)postDiv.querySelector('.post').classList.add('selected_post');
      });
    })
    .catch(error => {
      console.error('Error fetching posts:', error);
    });
}






dragbar.addEventListener('mousedown', (e)=> {
    flag = true;
    const startX = e.clientX;
    left.style.display = "flex";
    right.style.display = "flex";

    initialOffsetX = startX - dragbar.getBoundingClientRect().left;


    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopDragging);

    function resize(e) {
      if (!flag) return;
      const offsetX = e.clientX - initialOffsetX;
      newLeftWidth = offsetX;

      // Set minimum width for panels
        left.style.width = `${newLeftWidth}px`;

    }

    function stopDragging() {
      flag = false;
      if(newLeftWidth <= window.innerWidth/4 ){
            left.style.width = `0px`;
            left.style.display = 'None';
            right.style.flex = '1';
        }
        else if(newLeftWidth >= 3*window.innerWidth/4){
            right.style.display = 'None';
            left.style.display = '1';
            left.style.width = window.innerWidth+'px';
        }
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopDragging);
    }
});


function updateVoteText(vote_text, comment_number, postId){
  fetch(`/getHowManyVote=${postId}`)
    .then(response => response.json()) // Fix the typo here
    .then(data => {
      if (data.voteCount !== undefined)
        vote_text.textContent = data.voteCount;
      if (data.commentCount !== undefined)
        comment_number.textContent = data.commentCount+` replies`;
      })
    .catch(error => {
      console.error('Error fetching replies:', error);
    });
}


function handleVote(postId, voteType, vote_text) {
    fetch('/setReaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('authToken')
    },
    body: JSON.stringify({ postId, voteType })
  })
    .then(response => response.json())
    .then(result => {
        if(result.error)throw new Error(result.error);
        vote_text.textContent = result.voteCount;
        try{
          vote_text.previousElementSibling.classList.remove('selected_post');
          vote_text.nextElementSibling.classList.remove('selected_post');
          if(result.userReaction === 1) vote_text.previousElementSibling.classList.add('selected_post');
          else if(result.userReaction === -1) vote_text.nextElementSibling.classList.add('selected_post');
        }catch(error){console.log('error: '+postId)}
    })
    .catch(error => {
      console.log('hoilo na '+error);
      login();
      // Error handling
    });
}


async function getUsername(){
    const response = await fetch('/getUsername', {
    method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('authToken')
      }
    });
    const result = await response.json();

    if (response.ok) {
      const username = result.user_id;
      console.log(username);
      return username;
    }
    return "";
}

async function navToolBar(){
  leftPanel.style.width = window.innerWidth/3 + 'px';
  const username = await getUsername();
  questionsContainer.innerHTML=`
    <div class="navToolBarAll">
      <div class="pristineTop">
        <div class="pristine2">
          <input class="pristine" type="checkbox" name="toggle" onclick=toggleAnonymous() value="on">
        </div>

        <div class="patterns">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="polka-dots" x="0" y="0" width="100" height="100"
                      patternUnits="userSpaceOnUse">
                <circle fill="#be9ddf" cx="25" cy="25" r="3"></circle>
              </pattern>
                <style>
                  @import url("https://fonts.googleapis.com/css?family=Lora:400,400i,700,700i");
                </style>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#polka-dots)"> </rect>
        <text x="50%" y="60%"  text-anchor="middle"  >
          ${username}
        </text>
        </svg>
        </div>


      </div>

      <div class="bounce bounce-login" onclick=login()>
        <span class="letter">L</span>
        <span class="letter">O</span>
        <span class="letter">G</span>
        <span class="letter">I</span>
        <span class="letter">N</span>
      </div>


      <div class="bounce bounce-logout" onclick=logout()>
        <span class="letter">L</span>
        <span class="letter">O</span>
        <span class="letter">G</span>
        <span class="letter">O</span>
        <span class="letter">U</span>
        <span class="letter">T</span>
      </div>


        <div class="letter-image">
          <div class="animated-mail">
            <div class="back-fold"></div>
            <div class="letter">
              <div class="letter-border"></div>
              <div class="letter-title"></div>
              <div class="letter-context"></div>
              <div class="letter-stamp">
                <div class="letter-stamp-inner"></div>
              </div>
            </div>
            <div class="top-fold"></div>
            <div class="body"></div>
            <div class="left-fold"></div>
          </div>
          <div class="shadow"></div>
        </div>






      <div class="main newPostArea">
          <span>P</span>
          <span class="spacious">
            <textarea type="text" class="nobg"></textarea>
          </span>
          <span>S</span>
          <span>T</span>
          <span>
            <button class="text comment-submit-btn">
                <i class="text fas fa-paper-plane new-post-submit"></i> <!-- Font Awesome paper plane icon -->
              </button>
            </span>
      </div>
    </div>
  `;
  const checkbox = questionsContainer.querySelector('input[type="checkbox"]');
  const postTextBox = questionsContainer.querySelector('.new-post-submit');
  const animatedMail = questionsContainer.querySelector('.letter-image');
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      checkbox.classList.add('checkbox-toggled');
    } else {
      checkbox.classList.remove('checkbox-toggled');
    }
  });
  if(username===''){
    questionsContainer.querySelector('.bounce-logout').style.display='None';
    checkbox.style.display = 'None';
    animatedMail.style.display = 'None';
    questionsContainer.querySelector('.newPostArea').style.display = 'None';
  }
  else{

    postTextBox.addEventListener('click', function(){
      newPostSubmit(null, questionsContainer.querySelector('.nobg').value);
    });
    questionsContainer.querySelector('.bounce-login').style.display = 'none';

    if (username === 'Anonymous') {
      checkbox.classList.add('checkbox-not-toggled');
    } else {
      checkbox.classList.add('checkbox-toggled');  // Checked
    }

    animatedMail.addEventListener('click', showMyInbox);

  }



  questionsContainer.appendChild(msgPortal);
  // questionsContainer.appendChild(anonymousButton);

  leftPanel.style.width = window.innerWidth/2+'px';
}



function newPostSubmit(root_post, txt){
    console.log(txt);
    fetch('/postSubmit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('authToken')
    },
    body: JSON.stringify({ root_post, txt })
  })
    .then(response => response.json())
    .then(result => {
        if (!result.postId)throw new Error(result.error);
        if(root_post)
        window.location.href='/'+root_post;
        else window.location.href = '/'+result.postId;
    })
    .catch(error => {
      login();
      console.log('hoilo na kono karone');
      // Error handling
    });
}



function showMyInbox(){
    fetch('/showMyInbox', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('authToken')
    }
  })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      // if (!result.postId)throw new Error(result.error);
      questionsContainer.innerHTML='';
      result.forEach(inbox => {
        const postDiv = document.createElement('div');
        postDiv.innerHTML = `
          <div class="text one_quesion">
            <button class="text btn user-id" onclick="showChatBoxInRightPanel('${inbox.users}')">
              ${inbox.users}
            </button>
              <button class="text btn post">
                <a class="text fake-link">
                  <div class="text post">${inbox.message}</div>
                </a>
              </button>
          </div>
        `;
        postDiv.querySelector('.post').addEventListener('click', function(){
          showChatBoxInRightPanel(inbox.users);
        });
        questionsContainer.appendChild(postDiv);
      });
    })
    .catch(error => {
      login();
      console.log('hoilo na kono karone');
      // Error handling
    });
}


function showChatBoxInRightPanel(user){
  rightPanel.style.display = 'flex';
  topQuestionPanel.innerHTML = `
    <div class="btn inbox-header selected_post">
    ${user}
    </div>
  `;


  commentBox.innerHTML = `
            <span class="spacious">
              <textarea type="text" class="nobg"></textarea>
            </span>
            <button class="text comment-submit-btn">
              <i class="text fas fa-paper-plane"></i> <!-- Font Awesome paper plane icon -->
            </button>
          `;
        commentBox.querySelector('.comment-submit-btn').addEventListener('click', function(){
          sendMessage(user, commentBox.querySelector('.nobg').value, 0);
        });


  fetch('/showChat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('authToken')
    },
    body: JSON.stringify({user})
  })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      // if (!result.postId)throw new Error(result.error);
      repliesContainer.innerHTML='';
      result.forEach(inbox => {
        const postDiv = document.createElement('div');
        postDiv.innerHTML = `
          <div class="text one_quesion sent">
            <button class="text btn user-id" onclick="showChatBoxInRightPanel('${inbox.sender}')">
              ${inbox.sender}
            </button>
              <button class="text btn post">
                <a class="text fake-link">
                  <div class="text post">${inbox.message}</div>
                </a>
              </button>
          </div>
          <div class="text one_quesion received">

              <button class="text btn post">
                <a class="text fake-link">
                  <div class="text post">${inbox.message}</div>
                </a>
              </button>
              <button class="text btn user-id" onclick="showChatBoxInRightPanel('${inbox.sender}')">
              ${inbox.sender}
            </button>
          </div>
        `;
        if(user===inbox.sender){
          postDiv.querySelector('.received').style.display= 'none';
        }
        else postDiv.querySelector('.sent').style.display= 'none';
        postDiv.querySelector('.post').addEventListener('click', function(){
          showChatBoxInRightPanel(inbox.users);
        });
        repliesContainer.appendChild(postDiv);
      });
    })
    .catch(error => {
      login();
      console.log('hoilo na kono karone');
      // Error handling
    });
}


function sendMessage(user, message, anonymous){
  fetch('/sendMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('authToken')
    },
    body: JSON.stringify({user, message, anonymous})
  })
    .then(response => response.json())
    .then(result => {
        showChatBoxInRightPanel(user);
    })
    .catch(error => {
      console.log('hoilo na');
    });
}


function toggleAnonymous() {
    fetch('/toggleAnonymous', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('authToken')
    }
  })
    .then(response => response.json())
    .then(result => {
        navToolBar();
    })
    .catch(error => {
      console.log('hoilo na');
    });
}





const switchers = document.querySelectorAll('.switcher');

switchers.forEach(item => {
	item.addEventListener('click', function() {
		switchers.forEach(item => item.parentElement.classList.remove('is-active'))
		this.parentElement.classList.add('is-active')
	})
});


// Change the address without refreshing the page
function changeAddressWithoutRefresh(newURL) {
  window.history.pushState(null, '', newURL);
  postId = newURL;
  refreshRightPanel();
}

