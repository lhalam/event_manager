from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.CompanyView.as_view(), name='companies'),
    url(r'^(?P<company_id>\d+)/$', views.CompanyView.as_view(), name='company'),
    url(r'^(?P<company_id>\d+)/teams/$', views.TeamView.as_view(), name='teams'),
    url(r'^(?P<company_id>\d+)/teams/(?P<team_id>\d+)/$', views.TeamView.as_view(), name='team'),
    url(
        r'^(?P<company_id>\d+)/teams/(?P<team_id>\d+)/user_assignment/$',
        views.TeamUserAssignmentView.as_view(), name='team_assignment'
        ),
]
