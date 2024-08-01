const btn = document.querySelector("#sendPost");

btn.addEventListener("click", async () => {
  const postBody = document.querySelector("#compose-body").value;
  // Async fetch
  try {
    response = await fetch('/newpost', {
      method: 'POST',
        body: JSON.stringify({
          post_body: postBody
        })
    })
    result = await response.json();
    console.log(result);

  } catch (error) {
    console.log(`Error: ${error}`)
  }
  // loadPosts();
})

function loadPosts() {
  const postsView = document.querySelector("#posts-view");
  // We need to: generate 10 posts per page, and separate into pages; 
  // give ability to comment on each post.
}
