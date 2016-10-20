from django.conf.urls import url
from .forms import LoginForm
from django.contrib.auth import views
from .views import login

urlpatterns = [
    url(r'^login', login, {'template_name': 'login.html', 'authentication_form': LoginForm}, name='login'),
    url(r'^logout', views.logout, name='logout')
]
