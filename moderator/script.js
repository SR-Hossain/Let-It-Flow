document.addEventListener('DOMContentLoaded', main);
const text_top = document.querySelector('.text-top');
const text_bottom = document.querySelector('.last_row');
const main_body = document.querySelector('.alternate-body');
const animated_body = document.querySelector('.animated-title');
const search_result_div = document.querySelector('.results');
const loginBox = `
        <div>
            <input class="btn username" placeholder="Username" type="text">
          <input class="btn password" placeholder="Password" type="password">
          <button class="btn login_button" onclick="authentication()">Login</button>
        </div>
    `;
const login_as_admin = `
    <div>
        <span class="first_row">Login as Moderator</span>
        <span class="second_row"></span>
    </div>
`;
const assign_role = `
    <div>
        <span class="second_row"><button class="btn" onclick="manageUsers()">Manage Users</button></span>
        <span class="second_row"><button class="btn" onclick="managePosts()">Manage Posts</button></span>
    </div>
`;
const remove_role = `
    <div>
        <button class="btn" onclick="logout()">Log Out</button>
    </div>
`;

function main(){
    checkIfAuthenticated();
}

async function checkIfAuthenticated() {
    try {
        const response = await fetch('/isItAdmin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: localStorage.getItem('authToken')
            }
        });
        const data = await response.json();

        console.log(data);
        if (data.message === 'Login successful') {
            workPage();
        } else {
            loginPage();
        }
    } catch (error) {
        loginPage();
    }
}


function loginPage(){
    text_top.innerHTML = login_as_admin;
    text_bottom.innerHTML = loginBox;
}
function logout(){
  localStorage.removeItem('authToken');
  main();
}

function authentication(){
    const username = document.querySelector('.username').value;
    const password = document.querySelector('.password').value;
    console.log(password);
    // Send login data to the server for authentication
    fetch('/admin_login', {
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
            workPage();
        navToolBar();
        } else {
            alert('Login failed. Please check your credentials.');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
    });
}


function workPage(){
    animated_body.style.display='block';
    search_result_div.innerHTML = '';
    main_body.innerHTML = '';
    text_top.innerHTML = assign_role;
    text_bottom.innerHTML = remove_role;
}


function manageUsers(){
    animated_body.style.display='none';
    main_body.innerHTML = `
        <button class="btn" onclick="workPage()">←</button>
        <select class="selected_option box btn">
        <option selected>All</option>
        <option>Expert</option>
        <option>General</option>
        </select>
        <input type="text" class="search_input btn post box">
    `;
    const search_button = document.querySelector('.search_input');
    searchUsers(search_button.value, document.querySelector('.selected_option').value);
    search_button.addEventListener('keyup', function(event) {
        searchUsers(search_button.value, document.querySelector('.selected_option').value);
    });
    document.querySelector('.selected_option').addEventListener('change', function(){
        searchUsers(search_button.value, document.querySelector('.selected_option').value);
    })
}


function searchUsers(searchQuery, role){
        fetch('/searchUsers?q='+searchQuery+'&role='+role)
          .then(response => response.json())
          .then(users => {
              search_result_div.innerHTML = '';
            users.forEach(user => {
              const postDiv = document.createElement('div');
              postDiv.innerHTML = `
                <div class="text one_quesion">
                    <button class="text btn user-id">
                        ${user.user_id}
                    </button>
                    <select class="selected_user_role box btn">
                        <option ${user.role === "Expert" ? "selected" : ""}>Expert</option>
                        <option ${user.role === "General" ? "selected" : ""}>General</option>
                    </select>
                    <button class="btn remove-btn">Remove</button>
                </div>
              `;
                postDiv.querySelector('.remove-btn').addEventListener('click', function(){
                        const username = user.user_id;
                        fetch('/removeUser', {
                            method: 'POST',
                            headers: {
                            'Content-Type': 'application/json',
                            Authorization: localStorage.getItem('authToken')
                            },
                            body: JSON.stringify({ username })
                        })
                        .then(response => response.json())
                        .then(result => {
                            if(result.error)throw new Error(result.error);
                        })
                        .catch(error => {
                        main();
                        });
                });
                postDiv.querySelector('.selected_user_role').addEventListener('change', function(){
                    const newRole = postDiv.querySelector('.selected_user_role').value;
                    const username = user.user_id;
                    fetch('/userRoleUpdate', {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        Authorization: localStorage.getItem('authToken')
                        },
                        body: JSON.stringify({ username, newRole })
                    })
                        .then(response => response.json())
                        .then(result => {
                            if(result.error)throw new Error(result.error);
                        })
                        .catch(error => {
                        console.log('hoilo na '+error);
                        main();
                        });
                });
                search_result_div.appendChild(postDiv);
            });
          })
          .catch(error => {
            console.error('Error fetching posts:', error);
          });
}


function managePosts(){
    animated_body.style.display='none';
    main_body.innerHTML = `
        <button class="btn" onclick="workPage()">←</button>
        <input type="text" class="search_input btn post box">
    `;
    const search_button = document.querySelector('.search_input');
    searchPosts(search_button.value);
    search_button.addEventListener('keyup', function(event) {
        searchPosts(search_button.value);
    });
}



function searchPosts(searchQuery){
        fetch('/searchPosts?q='+searchQuery)
          .then(response => response.json())
          .then(posts => {
              search_result_div.innerHTML = '';
            posts.forEach(post => {
              const postDiv = document.createElement('div');
              postDiv.innerHTML = `
                <div class="text one_quesion">
                  <button class="text btn post-user-id">
                    ${post.user_id} (${post.role})
                    <div class="text post-created">${post.post_created}</div>
                  </button>
                    <button class="text btn post">
                      <a class="text fake-link" href="http://localhost:3000/${post.post_id}">
                        <div class="text post">${post.post}</div>
                      </a>
                    </button>
                    <button class="btn remove-btn remove-post-btn">Remove</button>
                </div>
              `;
                postDiv.querySelector('.remove-btn').addEventListener('click', function(){
                        const postId = post.post_id;
                        fetch('/removePost', {
                            method: 'POST',
                            headers: {
                            'Content-Type': 'application/json',
                            Authorization: localStorage.getItem('authToken')
                            },
                            body: JSON.stringify({ postId })
                        })
                        .then(response => response.json())
                        .then(result => {
                            if(result.error)throw new Error(result.error);
                            searchPosts(searchQuery);
                        })
                        .catch(error => {
                        main();
                        });

                        searchPosts(searchQuery);
                });
                search_result_div.appendChild(postDiv);
            });
          })
          .catch(error => {
            console.error('Error fetching posts:', error);
          });
}

