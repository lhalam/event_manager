import json
import time

from datetime import datetime

from django.core.exceptions import PermissionDenied
from django.views import View
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.shortcuts import redirect, reverse, render

from .models import User, RegistrationConfirm
from .forms import RegistrationForm
from events import settings

CONFIRM_LINK = settings.HOST_NAME + '/registration/confirm/'


class EmailSender(object):
    @staticmethod
    def send_registration_confirm(user):
        confirm = RegistrationConfirm.objects.create(user=user)
        subject = 'Confirm registration'
        message = render_to_string('email.txt', {'link': CONFIRM_LINK + str(confirm.hash_code), 'name': user.first_name})
        return send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email]) == 1


class RegistrationView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('/')
        return render(request, 'registration.html')

    def post(self, request):
        body_unicode = request.body.decode('utf-8')
        registration_data = json.loads(body_unicode)
        registration_form = RegistrationForm(registration_data)
        errors = registration_form.errors
        if float(registration_data['birth_date']) > time.time():
            errors['birth_date'] = ['Birth date is not valid']

        if registration_form.is_valid() and not errors:
            user = User.objects.create_user(
                username=registration_data.get('email'),
                first_name=registration_data.get('first_name'),
                last_name=registration_data.get('last_name'),
                email=registration_data.get('email'),
                is_active=False,
                password=registration_data.get('password'),
                birth_date=datetime.fromtimestamp(float(registration_data.get('birth_date'))).strftime('%Y-%m-%d')
            )

            EmailSender.send_registration_confirm(user)

            return JsonResponse({'message': 'To finish registration follow instructions in email'}, status=201)

        return JsonResponse({'errors': errors}, status=400)


class ConfirmRegistrationView(View):
    def get(self, request, hash_code):
        user = RegistrationConfirm.close_confirm(hash_code)

        if not user:
            return redirect(reverse('reg:main'))

        return redirect(reverse('auth:login'))
