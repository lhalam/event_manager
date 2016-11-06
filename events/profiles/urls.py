from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView
from . import views

urlpatterns = [
	url(r'^photo/$', views.FileManager.as_view(), name='profile'),
    url(r'^(?P<profile_id>\d+)/$', views.ProfileView.as_view(), name='profile'),
]