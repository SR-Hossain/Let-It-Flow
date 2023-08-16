document.addEventListener('DOMContentLoaded', () => {
  const questionsContainer = document.querySelector('.questions');
  const postId = window.location.pathname.substr(1); // Extract postId from the URL
  const topQuestionPanel = document.querySelector('.topQuestionPanel');
  const repliesContainer = document.querySelector('.replies');
  const commentBox = document.querySelector('.comment-box')
  fetch('/getQuestions')
    .then(response => response.json())
    .then(posts => {
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
      });
    })
    .catch(error => {
      console.error('Error fetching posts:', error);
    });


  fetch('/getPost='+postId)
    .then(response => response.json())
    .then(posts => {
      posts.forEach(post => {
        let rootPost = post.root_post;
        if (rootPost === null)rootPost = ' ';
        topQuestionPanel.innerHTML = `
          <button>
          <a href="/${rootPost}">
            <i class="fas fa-arrow-left"></i> <!-- Font Awesome left arrow icon -->
            </a>
          </button>
          <div class="selected_question btn post">
                <a class="fake-link-long" href="/${post.post_id}">
                  <div class="post">${post.post}</div>
                </a>
              <button class="btn user-id-short">
                ${post.user_id}
                <div class="post-created">${post.post_created}</div>
              </button>
            </div>
          </div>
        `;
        commentBox.innerHTML = `
            <textarea class="comment-input" placeholder="Add a comment..."></textarea>
            <button class="comment-submit-btn">
              <i class="fas fa-paper-plane"></i> <!-- Font Awesome paper plane icon -->
            </button>
          `;
      });
    })
    .catch(error => {
      console.error('Error fetching posts:', error);
    });




    fetch('/getReplies='+postId)
    .then(response => response.json())
    .then(replies => {
        replies.forEach(reply => {
          const replyDiv = document.createElement('div');
          replyDiv.innerHTML = `
          <a href="/${reply.post_id}">
            <button class="comments">
              <div class="sender">${reply.user_id} --> ${reply.formatted_time} </div>
              <div class="comment"></div>
              <div class="clickOnReplies">
                ${reply.post}
              </div>
            </button>
            </a>
          `;
          repliesContainer.appendChild(replyDiv);

        })
    })
    .catch(error => {
      console.error('Error fetching replies:', error);
    });



});



function showComments(postId, postText) {
  // Use the post object to decide which properties to use
  console.log('ashse eikhaneo');
  const selected_question = document.querySelector('.selected_question');
  selected_question.textContent = postText+' ';
}

const dragBar = document.getElementById('dragBar');
const wrapper = dragBar.closest('.drag-bar');
const leftPanel = document.querySelector('.questions');
const rightPanel = document.querySelector('.right-panel');
let isDragging = false;
let initialOffsetX = 0;



// Check screen width and disable drag bar if small screen
const screenWidth = window.innerWidth;
if (screenWidth <= 768) {
  dragBar.style.display = 'none';
}
else {
  dragBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    const startX = e.clientX;

    initialOffsetX = startX - dragBar.getBoundingClientRect().left;


    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopDragging);

    function resize(e) {
      if (!isDragging) return;
      const offsetX = e.clientX - initialOffsetX;
      const newLeftWidth = offsetX;

      // Set minimum width for panels
      if (newLeftWidth >= 500 && newLeftWidth <= window.innerWidth - 500) {
        leftPanel.style.width = `${newLeftWidth}px`;
        rightPanel.style.width = `${window.innerWidth - newLeftWidth}px`;
      }
    }

    function stopDragging() {
      isDragging = false;
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopDragging);
    }
  });
}

