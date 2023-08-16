document.addEventListener('DOMContentLoaded', () => {
  const questionsContainer = document.querySelector('.questions');
  const postId = window.location.pathname.substr(1); // Extract postId from the URL
  const topQuestionPanel = document.querySelector('.topQuestionPanel');
  const repliesContainer = document.querySelector('.replies');

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
        <div class="back" onclick="gotoRootPost(${post.post_id})">
          <button>
          <a href="/${rootPost}">
            <i class="fas fa-arrow-left"></i> <!-- Font Awesome left arrow icon -->
            </a>
          </button>
        </div>
        <div class="selected_question"></div>
            <div class="one_quesion">
              <button class="btn post">
                <a class="fake-link" href="/${post.post_id}">
                  <div class="post">${post.post}</div>
                </a>
              </button>
              <button class="btn user-id">
                ${post.user_id}
                <div class="post-created">${post.post_created}</div>
              </button>
            </div>
          </div>
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
