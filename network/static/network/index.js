document.addEventListener('DOMContentLoaded', () => {
  try {
    const btn = document.querySelector("#sendPost");
    btn.addEventListener("click", sendPost)

  }
  catch (error) {
    console.log("No button to listen for!");
  }

  displayPage(1);

})

function displayPost(view, post) {
  // This is a moment in which it is deeply misfortunate we are not using a 
  // front-end framework.
  let postHTML = `
    <div class="card" style="width: 18rem;">
      <div class="card-body" id="id${post['id']}">
        <h5 class="card-title">${post['userName']}</h5>
        <h6 class="card-subtitle mb-2 text-body-secondary">${post['timestamp']}</h6>
        <p class="card-text">${post['body']}</p>
        <span class="card-link">Likes: ${post['likes'].length}</span>
      </div>
    </div>`
  view.innerHTML += postHTML;
  cardBody = document.getElementById(`id${post['id']}`);
  console.log(`cardBody = ${cardBody}`)

  // That is, if the user is logged in, display the like button
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

}

async function displayPage(page) {
  console.log(`Displaying page ${page}`);
  let postsView = document.querySelector("#posts-view");
  postsView.innerHTML = "";

  try {
    // Get the posts:
    let response = await fetch(`/posts?page=${page}`);
    let result = await response.json();
    //console.log(result);

    let totalPages = Math.ceil(parseInt(result['totalCount']) / 10);

    let posts = result['posts']
    for (let post of posts) {
      displayPost(postsView, post)
    }

    if (totalPages > 1) {
      // We need to display a 'next' and a 'previous' button
      getPagination(postsView, page, totalPages);
    }

    if (userID != -1) {
      document.querySelector("#posts-view").addEventListener('click', async (event) => {
        likeImg = event.target.closest(".likeimg");
        postID = likeImg.dataset.id;
        console.log(`Sending like request on post with id ${postID}...`);
        try {
          let response = await fetch(`/like/${postID}`, {
            method: 'PUT',
            body: ""
          });
          result = await response.json();
          //console.log(result);
          let likeString = document.querySelector(`#id${postID} .card-link`).innerHTML;
          let likes = parseInt(likeString.split(/[ ,]+/)[1]);
          if (result['message'] === 'Post liked.') {
            likeImg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                  </svg>`;
            document.querySelector(`#id${postID} .card-link`).innerHTML = `Likes: ${++likes}`;

          }
          else if (result['message'] === 'Post unliked.') {
            likeImg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                  </svg>`;
            document.querySelector(`#id${postID} .card-link`).innerHTML = `Likes: ${--likes}`;
          }
        }
        catch (error) {
          console.log(`Error: ${error}`)
        }
      })
    }
  }
  catch (error) {
    console.log(`Error: ${error}`)
    return null;
  }

}

function getPagination(view, page, totalPages) {

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
  </nav>`

  let next = document.querySelector("#next");
  let prev = document.querySelector("#prev");
  if (page == 1) {
    prev.classList.add("disabled");
    next.addEventListener('click', () => {
      displayPage(page + 1);
    })
  }
  else if (page == totalPages) {
    next.classList.add("disabled");
    prev.addEventListener('click', () => {
      displayPage(page - 1);
    })
  }
  else {
    next.addEventListener('click', () => {
      displayPage(page + 1);
    })
    prev.addEventListener('click', () => {
      displayPage(page - 1);
    })
  }


}

async function sendPost() {
  const postForm = document.querySelector("#compose-body");
  const postBody = postForm.value;
  // Async fetch
  try {
    response = await fetch('/newpost', {
      method: 'POST',
      body: JSON.stringify({
        entry_body: postBody
      })
    })
    result = await response.json();
    console.log(result);

  }
  catch (error) {
    console.log(`Error: ${error}`)
  }

  postForm.value = "";
  displayPage(1);

}
