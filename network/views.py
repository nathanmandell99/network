import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import User, Post, Comment


@login_required
def following(request):
    return render(request, "network/following.html")


@csrf_exempt
@login_required
def follow_user(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
        if user in request.user.following.all():
            request.user.following.remove(user)
            return JsonResponse({"message": "Unfollowed user."}, status=201)

        else:
            request.user.following.add(user)
            return JsonResponse({"message": "Followed user."}, status=201)

    except User.DoesNotExist:
        return JsonResponse({"error": "Post does not exist."}, status=400)


@csrf_exempt
@login_required
def edit_post(request, post_id):
    try:
        post = Post.objects.get(pk=post_id)
        data = json.loads(request.body)
        new_body = data.get("new_body")
        post.body = new_body
        post.save()
        return JsonResponse({"message": f"Post {post_id} edited with new body: {new_body}."},
                            status=201)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post does not exist."}, status=400)


# Send the profile of the user in the context
def user_profile(request, user_id):
    user = User.objects.get(pk=user_id)
    return render(request, "network/profile.html", {
        "profile": user,
        "following": request.user in user.followers.all()
    })


# Get all of the user's likes. If the Post is already there, remove it.
# Otherwise, add it.
@csrf_exempt
@login_required
def like_post(request, post_id):
    try:
        post = Post.objects.get(pk=post_id)
        # If the user already likes the Post, unlike it.
        if post in request.user.likes.all():
            request.user.likes.remove(post)
            return JsonResponse({"message": "Post unliked."}, status=201)

        # Otherwise, like it.
        else:
            request.user.likes.add(post)
            return JsonResponse({"message": "Post liked."}, status=201)

    except Post.DoesNotExist:
        return JsonResponse({"error": "Post does not exist."}, status=400)


# It shouldn't be hard to refactor this to support only returning
# posts from accounts a user follows, or only from a given account.
# Probably we will need to also give all the comments related to a post.
def load_posts(request):
    profile_id = request.GET.get("user")
    if profile_id is not None:
        user = User.objects.get(pk=profile_id)
        posts = user.posts.all()

    elif request.GET.get("following"):
        users = request.user.following.all()
        # We have the users we are following. Now we need to get the posts
        # made by those users.
        posts = Post.objects.filter(user__in=users)

    else:
        posts = Post.objects.all()

    posts = posts.order_by("-timestamp").all()
    paginator = Paginator(posts, 10)
    page_number = int(request.GET.get("page") or 1)
    page_obj = paginator.get_page(page_number)

    return JsonResponse(
        {"posts": [post.serialize() for post in page_obj.object_list],
         "totalCount": posts.count()},
        safe=False)


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
        # Confirm the Post we are making a Comment on exists.
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
