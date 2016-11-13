"""events URL Configuration."""

from django.contrib import admin
from django.conf.urls import url, include
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required

from registration.views import RegistrationView

urlpatterns = [
    url(r'^$', login_required(TemplateView.as_view(template_name='base.html'), login_url='auth/login?next=/')),
    url(r'^admin/', admin.site.urls),
    url(r'^auth/', include('auth.urls', namespace='auth')),
    url(r'^registration/', include('registration.urls', namespace='reg')),
    url(r'^api/v1/events/', include('event.urls', namespace='event')),
    url(r'^api/v1/calendars/', include('calendars.urls')),
]
