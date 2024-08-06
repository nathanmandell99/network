from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField(
        "self", blank=True, related_name="followers")
    likes = models.ManyToManyField("post", related_name="likers")


class Post(models.Model):
    body = models.CharField(max_length=1024)
    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="posts")
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        likesQuery = self.likers.all()
        likers = []
        for user in likesQuery:
            likers.append(user.id)

        return {
            "id": self.id,
            "body": self.body,
            "userID": self.user.id,
            "userName": self.user.username,
            "timestamp": f"{self.timestamp.month}/{self.timestamp.day}/{self.timestamp.year}, {self.timestamp.time().strftime("%H:%M")}",
            "likes": likers
        }

    def __str__(self):
        return f"Post by {self.user} on {self.timestamp}"


class Comment(models.Model):
    body = models.CharField(max_length=1024)
    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="comments")
    timestamp = models.DateTimeField(auto_now_add=True)
    # Consider renaming this attribute to "parent_post"
    post = models.ForeignKey(
        "Post", on_delete=models.CASCADE, related_name="comments")

    def serialize(self):
        return {
            "body": self.body,
            "userID": self.user.id,
            "userName": self.user.username,
            "postID": self.post.id,
            "timestamp": self.timestamp
        }

    def __str__(self):
        return f"Comment by {self.user} on {self.post} on {self.timestamp}"
