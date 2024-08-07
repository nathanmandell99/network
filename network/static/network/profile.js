
document.addEventListener('DOMContentLoaded', () => {
  followBtn = document.querySelector('.toggle-follow');

  followBtn.addEventListener('click', async (event) => {

    let response = await fetch(`/follow/${profileID}`)
    let result = await response.json();

    console.log(result);

    followerCountElem = document.querySelector('#followers-count');
    followerCount = parseInt(followerCountElem.innerHTML)
    if (result['message'] === "Followed user.") {
      event.target.value = "Unfollow"
      followerCountElem.innerHTML = ++followerCount;

    }
    else {
      event.target.value = "Follow"
      followerCountElem.innerHTML = --followerCount;
    }
  })
})
