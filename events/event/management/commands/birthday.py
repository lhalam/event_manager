from event.models import Event, EventUserAssignment
from registration.models import User
from datetime import datetime
from datetime import timedelta
from companies.models import TeamUserAssignment, Team, Company

from django.core.management.base import BaseCommand
from django.template.loader import render_to_string
from django.core.mail import send_mail

from utils.EmailService import EmailSender

DEFAULT_LOCATION = '49.839683,24.029717'


class BirthDay(object):
    @staticmethod
    def company_admin_birthday(user):
        for team in Company.get_teams(TeamUserAssignment.objects.get(user=user).team.company.id):
            event = Event.objects.create(
                title=user.first_name + '`s ' + user.last_name + ' Birth Day',
                start_date=(datetime.now().timestamp()),
                end_date=((datetime.now() + timedelta(days=7)).timestamp()),
                location=DEFAULT_LOCATION,
                place=team.company.name,
                description='It`s time to collect some money.',
                owner=team.admin
            )
            participants = [member for member in Team.get_members(team) if member.get('id') != user.id]
            try:
                for participant in participants:
                    EventUserAssignment.objects.create(user=User.objects.get(username=participant.get('username')),
                                                       event=event)
            except:
                print('Can not create relation between user: {0} and event: {1}'.format(participant, event))

            EmailSender.send_birthday_invite(event, [user.get('username') for user in participants])

    @staticmethod
    def team_member_birthday(user):
        for team in TeamUserAssignment.get_user_teams(user):
            participants = set()
            for member in Team.get_members(team):
                if member.get('username') != user.username:
                    participants.add(member.get('username'))
            participants.add(team.company.admin.username)
            event_owner = team.admin
            if event_owner.username == user.username:
                team_members = sorted([User.get_by_id(member.get('id')) for member in Team.get_members(team)
                                       if member.get('id') != user.id],
                                      key=lambda value: value.date_joined)
                if not team_members:
                    team_members.append(team.company.admin)
                event_owner = team_members[0]

            event = Event.objects.create(
                title=user.first_name + '`s ' + user.last_name + ' Birth Day',
                start_date=(datetime.now().timestamp()),
                end_date=((datetime.now() + timedelta(days=7)).timestamp()),
                location=DEFAULT_LOCATION,
                place=team.company.name,
                description='It`s time to collect some money.',
                owner=event_owner
            )
            try:
                for participant in participants:
                    EventUserAssignment.objects.create(user=User.objects.get(username=participant),
                                                       event=event)
            except:
                print('Can not create relation between user: {0} and event: {1}'.format(participant, event))

            EmailSender.send_birthday_invite(event, participants)


class Command(BaseCommand):
    def handle(self, *args, **options):
        for user in User.get_nearest_birth_date():
            if Company.is_admin(user):
                BirthDay.company_admin_birthday(user)
            else:
                BirthDay.team_member_birthday(user)
