
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # APIs

    path("newpost", views.new_entry, name="newpost"),
    path("newcomment/<int:post_id>", views.new_entry, name="newcomment")
]
