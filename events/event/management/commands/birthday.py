from event.models import Event, EventUserAssignment
from registration.models import User
from datetime import datetime
from datetime import timedelta
from companies.models import TeamUserAssignment, Team

from django.core.management.base import BaseCommand, CommandError
from django.template.loader import render_to_string
from django.core.mail import send_mail

from django.utils import timezone

from events import settings

BIRTHDAY_EVENT__LINK = settings.HOST_NAME + '/#/events/'

class Command(BaseCommand):
    def handle(self, *args, **options):
        for user in User.get_nearest_birth_date():
            for team in TeamUserAssignment.get_user_teams(user):
                participants = set()
                for member in Team.get_members(team):
                    if member != user.username:
                        participants.add(member)
                participants.add(team.company.admin.username)
                event = Event.objects.create(
                    title=user.first_name + "'s " + user.last_name + ' Birth Day',
                    start_date = (datetime.now().timestamp()),
                    end_date = ((datetime.now() + timedelta(days=7)).timestamp()),
                    location = '49.562831, 25.522138',
                    place = 'Some place',
                    description = user.first_name + "'s" + user.last_name + ' Birth Day. It`s time to colect some money.',
                    owner = User.get_by_id(5)
                );
                print(User.objects.get(pk=5).to_dict())
                try:
                    for participant in participants:
                        EventUserAssignment.objects.create(user=User.objects.get(username=participant), event=event)
                except:
                    print('Can not create relation between user: {0} and event: {1}'.format(participant, event))
                subject = 'Birtday Event'
                message = render_to_string('birthday.txt', {'link': BIRTHDAY_EVENT__LINK + str(event.id), 'event': event.title})
                sent = send_mail(subject, message, settings.EMAIL_HOST_USER, participants)
                print(sent)
