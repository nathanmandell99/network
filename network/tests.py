from django.test import TestCase, Client

# Create your tests here.

import json
from .models import User, Post  # , Comment


# We could maybe clean this up by logging in during setUp and logging
# out for the authentication test
class TestNewEntry(TestCase):

    def setUp(self):

        self.client = Client()
        self.user = User.objects.create(username="test_user")
        self.user.set_password("password")
        self.user.save()

    def test_get(self):

        self.client.login(username="test_user", password="password")
        response = self.client.get("/newpost")  # , follow=True)

        self.assertEqual(response.status_code, 400)

    def test_empty_entry(self):

        self.client.login(username="test_user", password="password")

        response = self.client.post(
            "/newpost", content_type="application/json")

        self.assertTrue(json.loads(response.content)['error'])

    def test_authentication(self):

        response = self.client.post("/newpost",
                                    {"entry_body": "Test!"},
                                    content_type="application/json")

        self.assertEqual(response.status_code, 302)

    def test_valid_post(self):

        self.client.login(username="test_user", password="password")
        response = self.client.post("/newpost",
                                    {"entry_body": "Test!"},
                                    content_type="application/json")

        self.assertEqual(response.status_code, 201)

        self.assertTrue(Post.objects.get(
            pk=json.loads(response.content)['postID']))

    def test_valid_comment(self):

        self.client.login(username="test_user", password="password")
        response1 = self.client.post("/newpost",
                                     {"entry_body": "Test!"},
                                     content_type="application/json")

        self.assertEqual(response1.status_code, 201)

        postID = json.loads(response1.content)['postID']
        self.assertTrue(postID)
        newPost = Post.objects.get(pk=postID)
        self.assertTrue(newPost)

        response1 = self.client.post(f"/newcomment/{postID}",
                                     {"entry_body": "Test!"},
                                     content_type="application/json")

        self.assertEqual(response1.status_code, 201)


class TestLoadPosts(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create(username="test_user")
        self.user.set_password("password")
        self.user.save()
        self.internal_count = 0

    def test_no_entries(self):
        response = self.client.get("/posts")
        result = json.loads(response.content)
        count = int(result['totalCount'])
        self.assertEqual(count, 0)
        self.assertEqual(result['posts'], [])

    def test_page_1(self):
        for i in range(0, 10):
            new_post = Post(user=self.user, body=f"Test post {i}")
            new_post.save()
            self.internal_count += 1

        response = self.client.get("/posts?page=1")
        result = json.loads(response.content)
        count = int(result['totalCount'])
        self.assertEqual(count, self.internal_count)
        self.assertEqual(count, Post.objects.all().count())

        for i in range(0, 10):
            # cur_post uses 10-i because the route gives us reverse
            # chronological results and is not 0-indexed, meaning we have to go
            # "backwards" from 10
            cur_post = Post.objects.get(pk=(10-i))
            self.assertEqual(result['posts'][i]['body'],
                             cur_post.serialize()['body'])

    def test_page_2(self):
        self.test_page_1()

        for i in range(10, 20):
            new_post = Post(user=self.user, body=f"Test post {i}")
            new_post.save()
            self.internal_count += 1

        # Page 2 should be the same as page 1 was before we added
        # the new Posts.
        response = self.client.get("/posts?page=2")
        result = json.loads(response.content)
        count = int(result['totalCount'])
        self.assertEqual(count, self.internal_count)
        self.assertEqual(count, Post.objects.all().count())

        for i in range(0, 10):
            cur_post = Post.objects.get(pk=(10-i))
            self.assertEqual(result['posts'][i]['body'],
                             cur_post.serialize()['body'])

        response = self.client.get("/posts?page=1")
        result = json.loads(response.content)

        for i in range(0, 10):
            cur_post = Post.objects.get(pk=(20-i))
            self.assertEqual(result['posts'][i]['body'],
                             cur_post.serialize()['body'])


class TestLike(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create(username="test_user")
        self.user.set_password("password")
        self.user.save()
        for i in range(0, 10):
            new_post = Post(user=self.user, body=f"Test post {i}")
            new_post.save()

    def test_authentication(self):
        response = self.client.put("/like/1", content_type="application/json")

        self.assertEqual(response.status_code, 302)

    def test_bad_like(self):
        self.client.login(username="test_user", password="password")
        response = self.client.put(
            "/like/100", content_type="application/json")

        self.assertEqual(response.status_code, 400)

    def test_good_like(self):
        self.client.login(username="test_user", password="password")
        response = self.client.put(
            "/like/1", content_type="application/json")

        self.assertEqual(response.status_code, 201)

        result = json.loads(response.content)

        self.assertEqual(result['message'], "Post liked.")
        self.assertTrue(Post.objects.get(pk=1) in self.user.likes.all())

    def test_unlike(self):
        self.client.login(username="test_user", password="password")
        response = self.client.put(
            "/like/1", content_type="application/json")

        response = self.client.put(
            "/like/1", content_type="application/json")

        result = json.loads(response.content)

        self.assertEqual(result['message'], "Post unliked.")
        self.assertTrue(Post.objects.get(pk=1) not in self.user.likes.all())


class TestFollow(TestCase):
    def setUp(self):
        self.client = Client()
        self.user1 = User.objects.create(username="test_user1")
        self.user1.set_password("password")
        self.user1.save()
        self.user2 = User.objects.create(username="test_user2")
        self.user2.set_password("password")
        self.user2.save()

    def test_follow(self):
        self.client.login(username="test_user1", password="password")
        response = self.client.put("/follow/2",
                                   content_type="application/json")
        result = json.loads(response.content)
        self.assertEqual(result['message'], "Followed user.")
        self.assertTrue(self.user2 in self.user1.following.all())
        self.assertTrue(self.user1 in self.user2.followers.all())

    def test_unfollow(self):
        self.test_follow()

        response = self.client.put("/follow/2",
                                   content_type="application/json")
        result = json.loads(response.content)
        self.assertEqual(result['message'], "Unfollowed user.")
        self.assertTrue(self.user2 not in self.user1.following.all())
        self.assertTrue(self.user1 not in self.user2.followers.all())
