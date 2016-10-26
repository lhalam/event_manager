from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.CompanyView.as_view(), name='companies'),
    url(r'^(?P<company_id>\d+)/$', views.CompanyView.as_view(), name='company'),
]
