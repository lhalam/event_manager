import json

from django.core.exceptions import PermissionDenied
from django.views import View
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.shortcuts import redirect, reverse

from .models import User, RegistrationConfirm
from .forms import RegistrationForm
from events import settings


CONFIRM_LINK = settings.HOST_NAME + '/api/v1/reg/confirm/'


class EmailSender(object):
    @staticmethod
    def send_registration_confirm(user):
        confirm = RegistrationConfirm.objects.create(user=user)
        subject = 'Confirm registration'
        message = render_to_string('email.txt', {'link': CONFIRM_LINK + str(confirm.hash_code), 'name': user.first_name})
        return send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email]) == 1


class RegistrationView(View):
    def get(self, request):
        data = {'first_name': '', 'last_name': '', 'email': '', 'password': '', 'birth_date': ''}
        return JsonResponse(data, status=200)

    def post(self, request):
        body_unicode = request.body.decode('utf-8')
        registration_data = json.loads(body_unicode)
        registration_form = RegistrationForm(registration_data)
        if registration_form.is_valid():
            user = User.objects.create_user(
                username=registration_data.get('email'),
                first_name=registration_data.get('first_name'),
                last_name=registration_data.get('last_name'),
                email=registration_data.get('email'),
                is_active=False,
                password=registration_data.get('password'),
            )

            EmailSender.send_registration_confirm(user)

            return JsonResponse({'message': 'To finish registration follow instructions in email.'}, status=201)

        return JsonResponse({'errors': registration_form.errors}, status=400)


class ConfirmRegistrationView(View):
    def get(self, request, hash_code):
        try:
            user = RegistrationConfirm.close_confirm(hash_code)
        except PermissionDenied:
            return JsonResponse({'message': 'Link is not active.'}, status=403)

        if not user:
            return redirect(reverse('reg:main'))

        return JsonResponse({'user_id': user.id, 'email': user.email}, status=200)
