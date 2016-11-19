from django.contrib import admin
from django.conf.urls import url, include
from . import views


urlpatterns = [
    url(r"(?P<id>\d*)/$", views.CommentView.as_view(), name="comments"),
]