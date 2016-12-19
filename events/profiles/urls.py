from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^photo/$', views.FileManager.as_view(), name='profile'),
    url(r'^$', views.ProfileView.as_view(), name='profile'),
    url(r'^(?P<profile_id>\d+)/$', views.ProfileView.as_view(), name='profile'),
]
