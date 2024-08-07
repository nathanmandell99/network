
async function sendPost() {
  const postForm = document.querySelector("#compose-body");
  const postBody = postForm.value;

  try {
    response = await fetch('/newpost', {
      method: 'POST',
      body: JSON.stringify({
        entry_body: postBody
      })
    });
    result = await response.json();
    console.log(result);

  }
  catch (error) {
    console.log(`Error: ${error}`);
  }
  postForm.value = "";
  console.log(`Sent post and about to reload the display`);
  displayPage(1, profileID, following);
}
