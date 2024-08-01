from django.test import TestCase, Client

# Create your tests here.

import json
from .models import User  # , Post, Comment


class TestNewPost(TestCase):
    def setUp(self):

        self.client = Client()
        self.user = User.objects.create(username="test_user")
        self.user.set_password("password")
        self.user.save()

    def test_get(self):

        self.client.login(username="test_user", password="password")
        response = self.client.get("/newpost")  # , follow=True)

        self.assertEqual(response.status_code, 400)

    def test_valid_post(self):

        self.client.login(username="test_user", password="password")
        response = self.client.post("/newpost",
                                    {"post_body": "Test!"},
                                    content_type="application/json")

        self.assertEqual(response.status_code, 201)

    def test_empty_post(self):

        self.client.login(username="test_user", password="password")

        response = self.client.post(
            "/newpost", content_type="application/json")

        self.assertEqual(json.loads(response.content)['error'],
                         "Post must have a body (post_body).")
