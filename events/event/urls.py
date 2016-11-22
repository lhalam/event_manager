from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.EventView.as_view(), name='events'),
    url(r'^(?P<event_id>\d+)/$', views.EventView.as_view(), name='event'),
    url(r'^(?P<event_id>\d+)/user_assignment/$', views.EventUserAssignmentView.as_view(), name='user_assignment'),
]
