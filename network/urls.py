
from django.urls import path

from . import views

urlpatterns = [
    # Views
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<int:user_id>", views.user_profile, name="profile"),
    path("following", views.following, name="following"),

    # APIs
    path("newpost", views.new_entry, name="newpost"),
    path("newcomment/<int:post_id>", views.new_entry, name="newcomment"),
    path("posts", views.load_posts, name="posts"),
    path("like/<int:post_id>", views.like_post, name="likepost"),
    path("edit/<int:post_id>", views.edit_post, name="editpost"),
    path("follow/<int:user_id>", views.follow_user, name="followuser")
]
