from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^$', views.RegistrationView.as_view(), name='main'),
    url(r'^confirm/([0-9a-f]+)/$', views.ConfirmRegistrationView.as_view(), name='confirm'),
]
