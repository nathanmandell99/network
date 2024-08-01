import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Comment


# For now we will assume this simply retrieves all posts.
# Probably we will need to also give all the commends related to a post.
def load_posts(request):
    posts = Post.objects.all()
    print(posts)
    posts = posts.order_by("-timestamp").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)


# Takes either a Post or a Comment and saves it to the database.
# post_id is the id of the Post that the Comment is being made on. It
# is None if we are making a new Post.
# On a success, we return a JSON object with a success message, as
# well as the ID of the newly created entry.
@csrf_exempt
@login_required
def new_entry(request, post_id=None):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    entry_body = data.get("entry_body")
    # Confirm that the request is not empty.
    if entry_body is None:
        return JsonResponse({"error": "Entry must have a body (entry_body)."},
                            status=400)

    # Save a new Post
    if post_id is None:
        new_post = Post(user=request.user, body=entry_body)
        new_post.save()
        return JsonResponse({"message":
                            "New post received.",
                             "postID": new_post.id
                             }, status=201)
    # Save a new Comment
    else:
        post = Post.objects.get(pk=post_id)
        if post is not None:
            new_comment = Comment(user=request.user,
                                  body=entry_body, post=post)
            new_comment.save()
            return JsonResponse({"message":
                                 "New comment received.",
                                 "commentID": new_comment.id
                                 }, status=201)
        else:
            return JsonResponse({"error": "Post does not exist."},
                                status=400)


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
