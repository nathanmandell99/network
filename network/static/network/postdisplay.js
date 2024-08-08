// Set up event listeners for liking, editing, and commenting.
document.addEventListener('DOMContentLoaded', () => {
  if (userID != -1) {
    document.querySelector("#posts-view").addEventListener('click', async (event) => {
      likeImg = event.target.closest(".likeimg");
      if (likeImg) {
        postID = likeImg.dataset.id;
        try {
          let response = await fetch(`/like/${postID}`, {
            method: 'PUT',
            body: ""
          });
          result = await response.json();

          let likeString = document.querySelector(`#parent${postID} small`).innerHTML;
          let likes = parseInt(likeString.split(/[ ,]+/)[1]);

          if (result['message'] === 'Post liked.') {

            likeImg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                  </svg>`;

            document.querySelector(`#parent${postID} small`).innerHTML = `Likes: ${++likes}`;

          }
          else if (result['message'] === 'Post unliked.') {

            likeImg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                  </svg>`;

            document.querySelector(`#parent${postID} small`).innerHTML = `Likes: ${--likes}`;
          }
        }
        catch (error) {
          console.log(`Error: ${error}`);
        }
      }
      else if (event.target.classList.contains('send-comment')) {
        postID = event.target.dataset.postid;
        body = document.querySelector(`#comment-form${postID}`);
        sendComment(body, postID);
      }
      else if (event.target.classList.contains('edit-post-btn')) {
        // Add edit button listener
        let postID = event.target.dataset.postid;

        let postBody = document.querySelector(`#id${postID}`);
        let postBodyText = postBody.innerHTML;

        let textArea = document.querySelector(`#editbody${postID}`);
        console.log(`textArea = ${textArea}`);
        if (textArea) {
          textArea.style.display = 'block';
        }
        else {
          textArea = document.createElement('textarea');
          textArea.classList.add('form-control');
          textArea.value = postBodyText;
          textArea.setAttribute('id', `editbody${postID}`);
        }
        let submitBtn = document.querySelector(`#sbmt-edit${postID}`);
        if (submitBtn) {
          submitBtn.style.display = 'block';
        }
        else {
          submitBtn = document.createElement(`input`);
          submitBtn.classList.add('btn', 'btn-primary', 'send-edit-btn');
          submitBtn.setAttribute('id', `sbmt-edit${postID}`)
          submitBtn.dataset['postid'] = postID;
          submitBtn.type = 'submit';
          submitBtn.value = "Submit Edit";
        }

        postBody.parentNode.insertBefore(submitBtn, postBody.nextSibling);
        postBody.parentNode.insertBefore(textArea, postBody.nextSibling);

        postBody.style.display = 'none';
        event.target.style.display = 'none';
      }
      else if (event.target.classList.contains('send-edit-btn')) {
        // Get the body of the text area. Submit it to the API route. Reload page.
        postID = event.target.dataset.postid;
        console.log(`Submitting edit for post with ID ${postID}`);
        textArea = document.querySelector(`#editbody${postID}`);

        try {
          let response = await fetch(`/edit/${postID}`, {
            method: 'PUT',
            body: JSON.stringify({
              new_body: textArea.value
            })
          });
          result = await response.json();
          let postBody = document.querySelector(`#id${postID}`)
          document.querySelector(`#id${postID}`).innerHTML = textArea.value;
          textArea.style.display = 'none';
          postBody.style.display = 'block';
          document.querySelector(`#id${postID}`).style.display = 'block';
          event.target.closest(".send-edit-btn").style.display = 'none';
          document.querySelector(`#edit${postID}`).style.display = 'inline';

        }
        catch (error) {
          console.log(`Error: ${error}`);
        }
      }
    })
  }
})

function displayPost(view, post) {
  // This is a moment in which it is deeply misfortunate we are not using a 
  // front-end framework.

  // Adapted from: https://bbbootstrap.com/snippets/bootstrap-comments-list-font-awesome-icons-and-toggle-button-91650380
  let postHTML = `
  <div class="card p-3">
  <div class="d-flex justify-content-between align-items-center">
    <div class="user d-flex flex-row align-items-center">
      <span><small class="font-weight-bold text-primary"><a href="/profile/${post['userID']}">${post['userName']}</a></small><p id="id${post['id']}" class="font-weight-bold">${post['body']}</p></span>
    </div>
    <small>${post['timestamp']}</small>
    </div>
    <div class="action d-flex justify-content-between mt-2 align-items-center">
      <div class="reply px-4" id="parent${post['id']}">
        <small>Likes: ${post['likes'].length}</small>
        <span class="dots></span>
      </div>
    </div>
  </div>
    `
  view.innerHTML += postHTML;
  cardBody = document.getElementById(`parent${post['id']}`);

  // If the user is logged in, display the like button
  if (userID != -1) {
    likeImg = document.createElement('a');
    likeImg.classList.add('likeimg', 'card-link');
    likeImg.href = '#';
    likeImg.dataset['id'] = post['id'];
    if ((post['likes'].includes(userID))) {
      likeImg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
            </svg>`;
    }
    else {
      likeImg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
              <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
            </svg>`;
    }
    cardBody.append(likeImg);
  }

  // Display edit button if post belongs to current user
  if (userID === post['userID']) {
    console.log("Adding edit button");
    editBtn = document.createElement('a');

    editBtn.classList.add('card-link', 'edit-post-btn');
    editBtn.href = '#';
    editBtn.setAttribute('id', `edit${post['id']}`);
    editBtn.innerHTML = "Edit Post";
    editBtn.dataset['postid'] = post['id'];

    cardBody.append(editBtn);
  }


  //document.querySelector(`#send-comment${post['id']}`).addEventListener(
  //'click', event => sendComment(document.querySelector(`#compose-comment${post['id']}`), post['id']));

  // Display all the comments for the post
  if (post['comments'].length > 0) {
    let commentElem = document.createElement('ul');
    commentElem.classList.add('comments');
    for (let comment of post['comments']) {
      commentElem.innerHTML += `<li>Comment by ${comment['userName']}:<br>${comment['body']}</li>`
    }
    cardBody.append(commentElem);
  }

  // If the user is logged in, display comment form
  if (userID != -1) {
    commentForm = document.createElement('div');
    commentForm.classList.add('new-comment');
    commentForm.innerHTML = `
      <div class="container">
        <textarea id="comment-form${post['id']}" class="form-control compose-comment" placeholder="Post a comment"></textarea>
        <input data-postid="${post['id']}" type="submit" class="btn btn-primary send-comment" 
          value="Post Comment"/>
      </div>`
    cardBody.append(commentForm);
  }
}

async function displayPage(page, profileID = null, following = false) {
  console.log(`Displaying page ${page}`);
  let postsView = document.querySelector("#posts-view");
  postsView.innerHTML = "";
  let fetchString = `/posts?page=${page}`;
  if (profileID) {
    fetchString += `&user=${profileID}`;
  }
  else if (following) {
    fetchString += '&following=true';
  }

  try {
    // Get the posts:
    let response = await fetch(fetchString);
    let result = await response.json();

    let totalPages = Math.ceil(parseInt(result['totalCount']) / 10);
    let posts = result['posts'];
    console.log(posts);

    for (let post of posts) {
      displayPost(postsView, post);
    }
    if (totalPages > 1) {
      // We need to display a 'next' and a 'previous' button
      getPagination(postsView, page, totalPages, profileID);
    }
  }
  catch (error) {
    console.log(`Error: ${error}`);
    return null;
  }
}

function getPagination(view, page, totalPages, profileID = null, following = false) {
  view.innerHTML += `
  <nav aria-label="...">
    <ul class="pagination">
      <li class="page-item" id="prev">
        <a class="page-link" href="#">Previous</a>
      </li>
      <li class="page-item" id="next">
        <a class="page-link" href="#">Next</a>
      </li>
    </ul>
  </nav>`;

  let next = document.querySelector("#next");
  let prev = document.querySelector("#prev");
  if (page == 1) {
    prev.classList.add("disabled");
    next.addEventListener('click', () => {
      displayPage(page + 1, profileID, following);
    })
  }
  else if (page == totalPages) {
    next.classList.add("disabled");
    prev.addEventListener('click', () => {
      displayPage(page - 1, profileID, following);
    })
  }
  else {
    next.addEventListener('click', () => {
      displayPage(page + 1, profileID, following);
    })
    prev.addEventListener('click', () => {
      displayPage(page - 1, profileID, following);
    })
  }
}

async function sendComment(commentForm, postID) {
  console.log(`sending comment`);
  const commentBody = commentForm.value;

  try {
    response = await fetch(`/newcomment/${postID}`, {
      method: 'POST',
      body: JSON.stringify({
        entry_body: commentBody
      })
    });
    result = await response.json();
    console.log(result);

  }
  catch (error) {
    console.log(`Error: ${error}`);
  }
  commentForm.value = "";
  displayPage(1, profileID, following);
}
