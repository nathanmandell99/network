try {
  const btn = document.querySelector("#sendPost");
  btn.addEventListener("click", sendPost)
  
} 
catch (error) {
  console.log("No button to listen for!");
}

loadPosts(1);

function displayPost(view, post) {
  let postHTML = `<div class="container post">
                    <h5>Post by ${post['userName']} on ${post['timestamp']}</h5>
                    <p>${post['body']}</p>
                    </div>`;
  view.innerHTML += postHTML;
  
}

async function loadPosts(page) {
  console.log(`In loadPosts funct with page #${page}`)
  let postsView = document.querySelector("#posts-view");
  postsView.innerHTML = "";
  // We need to: generate 10 posts per page, and separate into pages; 
  // give ability to comment on each post.

  try {
    response = await fetch('/postcount');
    let result = await response.json();
    let count = result['count'];
    let totalPages = Math.ceil(count / 10);
    console.log(`Total pages: ${totalPages}`);
    // Get the posts:
    console.log(`Current value of page:`)
    posts = await getPage(page);
    for (let post of posts) {
      displayPost(postsView, post)
    }

    if (totalPages > 1) {
      getPagination(postsView, page, totalPages);
    }
  } 
  catch (error) {
    console.log(`Error: ${error}`)
    return null;
  }

}

// This is a HEAVY work in progress. Will probably completely
// refactor.
function getPagination(view, page, totalPages) {
  console.log(`In getPagination funct with page #${page}`)
  if (page == 1) {
    // Display pagination with no previous option, and page 1 highlighted.
    view.innerHTML += `
    <nav aria-label="...">
      <ul class="pagination">
        <li class="page-item disabled">
          <span class="page-link">Previous</span>
        </li>
        <li class="page-item active" aria-current="page">
          <span class="page-link" href="#">1</span></li>
        <li class="page-item" id="second">
          <a class="page-link" href="">2</a></li>`

    if (totalPages > 2) {
      view.innerHTML += `
        <li class="page-item" id="third">
          <a class="page-link" href="">3</a></li>`
    }

    view.innerHTML += `
        <li class="page-item">
          <a class="page-link" id="next-page" href="#">Next</a>
        </li>
      </ul>
    </nav>`

    let next = document.querySelector("#next-page");
    next.addEventListener('click', (event) => {
      event.preventDefault();
      loadPosts(page + 1);
    })
    let two = document.querySelector('#second');
    two.addEventListener('click', (event) => {
      event.preventDefault();
      loadPosts(2);
    })

  }

}

async function getPage(page) {
  // console.log(`Getting page ${page}`)
  let start = (page - 1) * 10;
  let end = start + 9;
  try {
    response = await fetch(`/posts?start=${start}&end=${end}`);
    console.log(`Received response from backend: ${response}`);
    posts = await response.json();
    console.log(posts);
    return posts;
  } 
  catch (error) {
    console.log(`Error: ${error}`);
    return None;
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
  loadPosts(1);
 
}
