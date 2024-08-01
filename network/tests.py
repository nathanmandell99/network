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
