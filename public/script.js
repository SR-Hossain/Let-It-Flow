document.addEventListener('DOMContentLoaded', () => {
  const questionsContainer = document.querySelector('.questions');
  const postId = window.location.pathname.substr(1); // Extract postId from the URL
  const topQuestionPanel = document.querySelector('.topQuestionPanel');
  const repliesContainer = document.querySelector('.replies');
  const commentBox = document.querySelector('.comment-box');
  const rightPanel = document.querySelector('.right-panel');
  const leftPanel = document.querySelector('.left-panel');
  showQuestionsInLeftPanel();
  // fetch('/getQuestions')
  //   .then(response => response.json())
  //   .then(posts => {
  //     posts.forEach(post => {
  //       const postDiv = document.createElement('div');
  //       postDiv.innerHTML = `
  //         <div class="one_quesion">
  //           <button class="btn user-id">
  //             ${post.user_id}
  //             <div class="post-created">${post.post_created}</div>
  //           </button>
  //             <button class="btn post">
  //               <a class="fake-link" href="/${post.post_id}">
  //                 <div class="post">${post.post}</div>
  //               </a>
  //             </button>
  //         </div>
  //       `;
  //       questionsContainer.appendChild(postDiv);
  //     });
  //   })
  //   .catch(error => {
  //     console.error('Error fetching posts:', error);
  //   });


  fetch('/getPost='+postId)
    .then(response => response.json())
    .then(posts => {
      posts.forEach(post => {
        let rootPost = post.root_post;
        if (rootPost === null)rootPost = ' ';
        topQuestionPanel.innerHTML = `
          <button onclick="sendTo('/${rootPost}')">
            <i class="fas fa-arrow-left"></i> <!-- Font Awesome left arrow icon -->
          </button>
          <div class="selected_question btn post">
                <a class="fake-link-long" href="/${post.post_id}">
                  <div class="post">${post.post}</div>
                </a>
              <button class="btn user-id-short">
                ${post.user_id}
                <div class="post-created">${post.post_created}</div>
              </button>
                  <button class="upvote-btn small-btn btn" onclick="handleVote(${post.post_id}, 'upvote', this.nextElementSibling)"><i class="fas fa-chevron-up"></i></button>
                  <button class="vote_count small-btn btn"></button> <!-- Corrected this line -->
                  <button class="downvote-btn small-btn btn" onclick="handleVote(${post.post_id}, 'downvote', this.previousElementSibling)"><i class="fas fa-chevron-down"></i></button>
                  <div class="replies-info"></div>
            </div>

          </div>
        `;
        updateVoteText(topQuestionPanel.querySelector('.vote_count'), topQuestionPanel.querySelector('.replies-info'), post.post_id);
        commentBox.innerHTML = `
            <textarea class="comment-input" placeholder="Add a comment..."></textarea>
            <button class="comment-submit-btn">
              <i class="fas fa-paper-plane"></i> <!-- Font Awesome paper plane icon -->
            </button>
          `;
      });
    })
    .catch(error => {
      leftPanel.style.flex = '1';
      leftPanel.style.display= 'flex';
      rightPanel.style.display = 'None';

      console.error('Error fetching posts:', error);
    });




    fetch('/getReplies='+postId)
    .then(response => response.json())
    .then(replies => {
        replies.forEach(reply => {
          const replyDiv = document.createElement('div');
          replyDiv.innerHTML = `
            <div class="reply-section">
              <a href="/${reply.post_id}" class="fake-link comments">
                <div class="sender">${reply.user_id} → ${reply.formatted_time}</div>
                <div class="clickOnReplies">${reply.post}</div>
                <div class="divider"></div> <!-- Dividing line -->
                <div class="replies-info"></div>
              </a>
              <div class="vote-section">
                <div class="vote-buttons">
                  <button class="upvote-btn small-btn btn" onclick="handleVote(${reply.post_id}, 'upvote', this.nextElementSibling)"><i class="fas fa-chevron-up"></i></button>
                  <button class="vote_count small-btn btn"></button> <!-- Corrected this line -->
                  <button class="downvote-btn small-btn btn" onclick="handleVote(${reply.post_id}, 'downvote', this.previousElementSibling)"><i class="fas fa-chevron-down"></i></button>
                </div>
              </div>
            </div>
          `;

          updateVoteText(replyDiv.querySelector('.vote_count'), replyDiv.querySelector('.replies-info'), reply.post_id);
          repliesContainer.appendChild(replyDiv);

        })
    })
    .catch(error => {
      console.error('Error fetching replies:', error);
    });






    const header = document.querySelector('.header');
    const inputSearch = document.querySelector('.search-box-click');
    const faArrowLeft = document.querySelector('.fa-arrow-left');
    // files = document.querySelector('#files'),
    // chatBox = document.querySelector('#chatBox'),
    // msg = document.querySelector('#Msg');

    inputSearch.addEventListener('focus', () => {
        header.classList.add('focus');
    });

    faArrowLeft.addEventListener('click', () => {
        header.classList.remove('focus');
        showQuestionsInLeftPanel();
    });


    inputSearch.addEventListener('keyup', (event) => {
        const searchQuery = inputSearch.value;
        fetch('/getResults?q='+searchQuery)
          .then(response => response.json())
          .then(posts => {
            questionsContainer.innerHTML = '';
            posts.forEach(post => {
              const postDiv = document.createElement('div');
              postDiv.innerHTML = `
                <div class="one_quesion">
                  <button class="btn user-id">
                    ${post.user_id}
                    <div class="post-created">${post.post_created}</div>
                  </button>
                    <button class="btn post">
                      <a class="fake-link" href="/${post.post_id}">
                        <div class="post">${post.post}</div>
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



});


function sendTo(url) {
  window.location.href = url;
}



function showComments(postId, postText) {
  // Use the post object to decide which properties to use
  console.log('ashse eikhaneo');
  const selected_question = document.querySelector('.selected_question');
  selected_question.textContent = postText+' ';
}


function showQuestionsInLeftPanel(){
  const questionsContainer = document.querySelector('.questions');
  const postId = window.location.pathname.substr(1); // Extract postId from the URL
  const topQuestionPanel = document.querySelector('.topQuestionPanel');
  const repliesContainer = document.querySelector('.replies');
  const commentBox = document.querySelector('.comment-box');
  const rightPanel = document.querySelector('.right-panel');
  const leftPanel = document.querySelector('.left-panel');
  fetch('/getQuestions')
    .then(response => response.json())
    .then(posts => {
      questionsContainer.innerHTML='';
      posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.innerHTML = `
          <div class="one_quesion">
            <button class="btn user-id">
              ${post.user_id}
              <div class="post-created">${post.post_created}</div>
            </button>
              <button class="btn post">
                <a class="fake-link" href="/${post.post_id}">
                  <div class="post">${post.post}</div>
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















const dragbar = document.querySelector('.drag-bar');
const left = document.querySelector('.left-panel');
const right= document.querySelector('.right-panel');
let flag = false;
let initialOffsetX = 0;
const screenWidth = window.innerWidth;
let newLeftWidth = left.style.width;



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
  console.log('function e ashse');
  fetch(`/vote?postId=${postId}&voteType=${voteType}`)
    .then(response => response.json()) // Fix the typo here
    .then(data => {
      if (data.voteCount !== undefined)
        vote_text.textContent = data.voteCount;
      })
    .catch(error => {
      console.error('Error fetching replies:', error);
    });
}




