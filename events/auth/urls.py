from django.conf.urls import url
from .forms import LoginForm
from django.contrib.auth import views

urlpatterns = [
    url(r'^login', views.login, {'template_name': 'login.html', 'authentication_form': LoginForm}, name='login'),
    url(r'^logout', views.logout, name='logout')
]
