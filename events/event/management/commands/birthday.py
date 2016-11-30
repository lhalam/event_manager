from event.models import Event, EventUserAssignment
from registration.models import User
from datetime import datetime
from datetime import timedelta
from companies.models import TeamUserAssignment, Team

from django.core.management.base import BaseCommand
from django.template.loader import render_to_string
from django.core.mail import send_mail

from events import settings

BIRTHDAY_EVENT__LINK = settings.HOST_NAME + '/#/events/'
DEFAULT_LOCATION = '0,0'


class Command(BaseCommand):
    def handle(self, *args, **options):
        for user in User.get_nearest_birth_date():
            for team in TeamUserAssignment.get_user_teams(user):
                participants = set()
                for member in Team.get_members(team):
                    if member != user.username:
                        participants.add(member.get('username'))
                participants.add(team.company.admin.username)
                event = Event.objects.create(
                    title=user.first_name + '`s ' + user.last_name + ' Birth Day',
                    start_date=(datetime.now().timestamp()),
                    end_date=((datetime.now() + timedelta(days=7)).timestamp()),
                    location=DEFAULT_LOCATION,
                    place=team.company.name,
                    description=user.first_name + '`s' + user.last_name + ' Birth Day. It`s time to colect some money.',
                    owner=team.admin
                );
                try:
                    for participant in participants:
                        EventUserAssignment.objects.create(user=User.objects.get(username=participant), event=event)
                except:
                    print('Can not create relation between user: {0} and event: {1}'.format(participant, event))
                subject = 'Birtday Event'
                message = render_to_string('birthday.txt', {'link': BIRTHDAY_EVENT__LINK + str(event.id), 'event': event.title})
                sent = send_mail(subject, message, settings.EMAIL_HOST_USER, participants)
