import json
import time, datetime

from django.views import View
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.shortcuts import redirect, reverse, render

from .models import User, RegistrationConfirm, BannedIP
from .forms import RegistrationForm
from utils.EmailService import EmailSender
from dateutil.relativedelta import relativedelta


class RegistrationView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('/')
        return render(request, 'registration.html')

    def post(self, request):
        ip = RegistrationView.get_ip(request)

        if not BannedIP.check_ip(ip):
            return JsonResponse({
                'errors': {
                    'ban': 'Due to suspicious activity you are banned for 5 minutes'
                }
            }, status=400)

        body_unicode = request.body.decode('utf-8')
        registration_data = json.loads(body_unicode)
        registration_form = RegistrationForm(registration_data)
        errors = registration_form.errors
        birth_date = float(registration_data.get('birth_date'))
        min_birth_date = time.mktime((datetime.datetime.now().date() - relativedelta(years=100)).timetuple())
        max_birth_date = time.mktime((datetime.datetime.now().date() - relativedelta(years=18)).timetuple())
        if not (min_birth_date < birth_date < max_birth_date):
            errors['birth_date'] = ['Birth date is not valid']

        if registration_form.is_valid() and not errors:
            user = User.objects.create_user(
                username=registration_data.get('email'),
                first_name=registration_data.get('first_name'),
                last_name=registration_data.get('last_name'),
                email=registration_data.get('email'),
                is_active=False,
                password=registration_data.get('password'),
                birth_date=datetime.datetime.fromtimestamp(birth_date).strftime('%Y-%m-%d')
            )

            EmailSender.send_registration_confirm(user)

            return JsonResponse({'message': 'To finish registration follow instructions in email'}, status=201)

        return JsonResponse({'errors': errors}, status=400)

    @staticmethod
    def get_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class ConfirmRegistrationView(View):
    def get(self, request, hash_code):
        user = RegistrationConfirm.close_confirm(hash_code)

        if not user:
            return redirect(reverse('reg:main'))

        ip = RegistrationView.get_ip(request)

        if BannedIP.check_ip(ip):
            BannedIP.clean_ip(ip)
        return redirect(reverse('auth:login'))
