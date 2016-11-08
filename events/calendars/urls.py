from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.Calendar.as_view(), name='calendars')
]
