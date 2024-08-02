from django.test import TestCase, Client

# Create your tests here.

import json
from .models import User, Post  # , Comment


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

    def test_authentication_required(self):

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

# TODO: Write tests for load_posts() view


# We are going to dump this route. That said since the functionality
# was moved to load_posts we can reuse some of these tests;
# class TestPostCount(TestCase):
#
#     def setUp(self):
#         self.client = Client()
#         self.user = User.objects.create(username="test_user")
#         self.user.set_password("password")
#         self.user.save()
#
#     def test_no_entries(self):
#         response = self.client.get("/postcount")
#         count = int(json.loads(response.content)['count'])
#         self.assertEqual(count, 0)
#
#     def test_entries(self):
#         internal_count = 0
#         for i in range(0, 10):
#             new_post = Post(user=self.user, body=f"Test post {i}")
#             new_post.save()
#             internal_count += 1
#
#         response = self.client.get("/postcount")
#         count1 = int(json.loads(response.content)['count'])
#         self.assertEqual(count1, internal_count)
#         self.assertEqual(count1, Post.objects.all().count())
#
#         for i in range(10, 15):
#             new_post = Post(user=self.user, body=f"Test post {i}")
#             new_post.save()
#             internal_count += 1
#
#         response = self.client.get("/postcount")
#         count2 = int(json.loads(response.content)['count'])
#         self.assertEqual(count2, internal_count)
#         self.assertEqual(count2, Post.objects.all().count())
