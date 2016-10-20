from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.contrib.auth import views as auth_views
# Create your views here.




def login(request, *args, **kwargs):
    if request.method == 'POST':
        if not request.POST.get('remember_me', None):
            request.session.set_expiry(10000)
    return auth_views.login(request, *args, **kwargs)