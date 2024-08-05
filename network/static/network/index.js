try {
  const btn = document.querySelector("#sendPost");
  btn.addEventListener("click", sendPost)

}
catch (error) {
  console.log("No button to listen for!");
}

displayPage(1);

function displayPost(view, post) {
  /*let postHTML = `<div class="container post">
                    <h5>Post by ${post['userName']} on ${post['timestamp']}</h5>
                    <p>${post['body']}</p>
                    </div>`;*/
  let postHTML = `
    <div class="card" style="width: 18rem;">
      <div class="card-body">
        <h5 class="card-title">${post['userName']}</h5>
        <h6 class="card-subtitle mb-2 text-body-secondary">${post['timestamp']}</h6>
        <p class="card-text">${post['body']}</p>
        <a href="#" class="card-link">Likes: </a>
        <a href="#" class="card-link">Like Post</a>
      </div>
    </div>`
  view.innerHTML += postHTML;

}

async function displayPage(page) {
  //console.log(`In loadPosts funct with page #${page}`)
  let postsView = document.querySelector("#posts-view");
  postsView.innerHTML = "";

  try {
    // Get the posts:
    response = await fetch(`/posts?page=${page}`);
    result = await response.json();
    console.log(result);

    let totalPages = Math.ceil(parseInt(result['totalCount']) / 10);

    let posts = result['posts']
    for (let post of posts) {
      displayPost(postsView, post)
    }

    if (totalPages > 1) {
      // We need to display a 'next' and a 'previous' button
      getPagination(postsView, page, totalPages);
    }
  }
  catch (error) {
    console.log(`Error: ${error}`)
    return null;
  }

}

function getPagination(view, page, totalPages) {
  // console.log(`In getPagination funct with page #${page}`)
  // Set up the innerHTML; if we're on the first or last page,
  // add the disabed class to prev or next respectively

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

  console.log(`Getting pagination for page ${page}, with ${totalPages} total pages`)
  let next = document.querySelector("#next");
  let prev = document.querySelector("#prev");
  if (page == 1) {
    prev.classList.add("disabled");
    next.addEventListener('click', (event) => {
      // event.preventDefault();
      displayPage(page + 1);
    })
  }
  else if (page == totalPages) {
    next.classList.add("disabled");
    prev.addEventListener('click', (event) => {
      // event.preventDefault();
      displayPage(page - 1);
    })
  }
  else {
    next.addEventListener('click', (event) => {
      // event.preventDefault();
      displayPage(page + 1);
    })
    prev.addEventListener('click', (event) => {
      // event.preventDefault();
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
