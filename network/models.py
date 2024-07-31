from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField("self", blank=True, related_name="followers")
    likes = models.ManyToManyField("post", related_name="likers")

class Post(models.Model):
    body = models.CharField(max_length=1024)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post by {self.user} on {self.timestamp}"

class Comment(models.Model):
    body = models.CharField(max_length=1024)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="comments")
    timestamp = models.DateTimeField(auto_now_add=True)
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="comments")

    def __str__(self):
        return f"Comment by {self.user} on {self.post} on {self.timestamp}"
