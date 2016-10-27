from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.Calendar.as_view(), name='calendars'),
    url(r'^(?P<user_id>\d+)/$', views.Calendar.as_view(), name='calendars'),
]
