try {
  const btn = document.querySelector("#sendPost");
  btn.addEventListener("click", sendPost)
  
} catch (error) {
  console.log("No button to listen for!");
}

loadPosts();

async function loadPosts() {
  let postsView = document.querySelector("#posts-view");
    postsView.innerHTML = "";
  // We need to: generate 10 posts per page, and separate into pages; 
  // give ability to comment on each post.

  // Get the posts:
  response = await fetch('/posts');
  posts = await response.json();
  console.log(posts);

  // We will need something better for limiting to 10 posts...
  i = 0;
  for (let post of posts) {
    if (i > 9) {
      break;
    }
    let postHTML = `<div class="container post">
                      <h5>Post by ${post['userName']} on ${post['timestamp']}</h5>
                      <p>${post['body']}</p>
                      </div>`;
    postsView.innerHTML += postHTML;
    i++;
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

  } catch (error) {
    console.log(`Error: ${error}`)
  }

  postForm.value = "";
  loadPosts();
 
}
