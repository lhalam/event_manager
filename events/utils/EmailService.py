from registration.models import User, RegistrationConfirm
from django.template.loader import render_to_string
from django.core.mail import send_mail

from events import settings

CONFIRM_LINK = settings.HOST_NAME + '/registration/confirm/'
BIRTHDAY_EVENT_LINK = settings.HOST_NAME + '/#/events/'


class EmailSender(object):
    @staticmethod
    def send_registration_confirm(user):
        confirm = RegistrationConfirm.objects.create(user=user)
        subject = 'Confirm registration'
        message = render_to_string('email.txt', {'link': CONFIRM_LINK + str(confirm.hash_code), 'name': user.first_name})
        return send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email]) == 1

    @staticmethod
    def send_birthday_invite(event, participants):
        subject = 'Birtday Event'
        message = render_to_string('birthday.txt', {'link': BIRTHDAY_EVENT_LINK + str(event.id),'event': event.title})
        sent = send_mail(subject, message, settings.EMAIL_HOST_USER, participants)
