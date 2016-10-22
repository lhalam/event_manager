from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.core.urlresolvers import reverse
from django.template.loader import render_to_string

from .forms import RegistrationForm
from .models import User, RegistrationConfirm
from events import settings


class EmailSender(object):
    def __init__(self, user):
        self.user = user

    def send_registrtion_confirm(self):
        link = RegistrationConfirm.create_confirm(self.user)
        subject = 'Confirm registration'
        message = render_to_string('email.txt', {'link': link, 'name': self.user.first_name })
        send_mail(subject, message, settings.EMAIL_HOST_USER, [self.user.email])


class RegistrationView(View):

    def get(self, request):
        return render(request, 'registration.html', {'form': RegistrationForm()})

    def post(self, request):
        form = RegistrationForm(request.POST)
        if form.is_valid():
            u = User()
            u.first_name = form.cleaned_data.get('first_name')
            u.last_name = form.cleaned_data.get('last_name')
            u.email = form.cleaned_data.get('email')
            u.username = form.cleaned_data.get('email')
            u.set_password(form.cleaned_data.get('password'))
            u.is_active = False
            u.save()
            EmailSender(u).send_registrtion_confirm()

            return render(request, 'base.html')

        return render(request, 'registration.html', {'form': form})


class ConfirmRegistrationView(View):
    def get(self, request, hash_code):
        user = RegistrationConfirm.close_confirm(hash_code)
        if user is None:
            return redirect(reverse('reg:main'))
        # TODO: login
        return render(request, 'base.html')