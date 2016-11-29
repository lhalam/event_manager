from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.VotingView.as_view(), name='votings'),
    url(r'^(?P<voting_id>\d+)/$', views.VotingView.as_view(), name='voting'),
    url(r'^(?P<voting_id>\d+)/choice/(?P<choice_id>\d+)/vote/$', views.ChoiceView.as_view(), name='vote'),
]
