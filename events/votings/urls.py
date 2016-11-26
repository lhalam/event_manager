from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.VotingView.as_view(), name='votings'),
    url(r'^(?P<voting_id>\d+)/$', views.VotingView.as_view(), name='voting'),
]
