import json
import re

from django.core.exceptions import PermissionDenied
from django.views import View
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.core.validators import validate_email as email_validator
from django import forms
from django.shortcuts import redirect, reverse
from datetime import datetime

from .models import User, RegistrationConfirm
from events import settings


CONFIRM_LINK = settings.HOST_NAME + '/api/v1/reg/confirm/'


class EmailSender(object):
    @staticmethod
    def send_registrtion_confirm(user):
        hash_code = RegistrationConfirm.create_confirm(user)
        subject = 'Confirm registration'
        message = render_to_string('email.txt', {'link': CONFIRM_LINK + hash_code, 'name': user.first_name})
        return send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email]) == 1


class RegistrationView(View):
    def get(self, request):
        data = {'first_name': '', 'last_name': '', 'email': '', 'password': '', 'password2': '', 'birth_date': ''}
        return JsonResponse(data, status=200)

    def post(self, request):
        body_unicode = request.body.decode('utf-8')
        data = json.loads(body_unicode)
        errors = RegistrationView.verify_data(data.get('password'),
                                              data.get('password2'),
                                              data.get('email'),
                                              data.get('birth_date'))
        if not errors:
            user = User()
            user.username = data.get('email')
            user.first_name = data.get('first_name')
            user.last_name = data.get('last_name')
            user.email = data.get('email')
            user.is_active = False
            user.set_password(data.get('password'))
            user.save()

            EmailSender.send_registrtion_confirm(user)

            return JsonResponse({'message': 'To finish registration follow instructions in email.'}, status=201)

        return JsonResponse({'errors': errors}, status=400)

    @staticmethod
    def verify_data(pass1, pass2, email, birth_date):
        password_regex = re.compile(r'^[A-Za-z0-9]{6,20}$')
        errors = []
        if not password_regex.match(pass1):
            errors.append('Password is not valid.')
        if not pass2 or pass1 != pass2:
            errors.append('Passwords are not equal.')
        try:
            email_validator(email)
        except forms.ValidationError:
            errors.append('Email is not valid.')

        try:
            datetime.strptime(birth_date, '%Y-%m-%d')
        except ValueError:
            errors.append('Birth date format is not valid.')

        try:
            User.objects.get(username=email)
        except User.DoesNotExist:
            return errors

        errors.append('User with this email already exists.')
        return errors


class ConfirmRegistrationView(View):
    def get(self, request, hash_code):
        try:
            user = RegistrationConfirm.close_confirm(hash_code)
        except PermissionDenied:
            return JsonResponse({'error_message': 'Link is already used.'}, status=403)

        if not user:
            return redirect(reverse('reg:main'))

        return JsonResponse({'user_id': user.id, 'email': user.email}, status=200)
