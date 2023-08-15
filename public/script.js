document.addEventListener('DOMContentLoaded', () => {
  const questionsContainer = document.querySelector('.questions');
  const postId = window.location.pathname.substr(1); // Extract postId from the URL
  const rightPanel = document.querySelector('.right-panel')
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


    fetch(`/${postId}`)
    .then(response => response.text())
    .then(postDetails => {
        fetch('/getReplies')
          .then(response => response.json())
          .then(replies => {
            replies.forEach(reply => {
              const replyDiv = document.createElement('div');
              replyDiv.innerHTML = `
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
    })
    .catch(error => {
      console.error('Error fetching post details:', error);
    });
});

function showComments(postId, postText) {
  // Use the post object to decide which properties to use
  console.log('ashse eikhaneo');
  const selected_question = document.querySelector('.selected_question');
  selected_question.textContent = postText+' ';
}
