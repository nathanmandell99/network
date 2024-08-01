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
