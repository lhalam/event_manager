from django.views.generic.base import View
from django.http.response import JsonResponse, HttpResponse

from .models import Voting, Choice, ChoiceUserAssignment, VotingUserAssignment
from registration.models import User
from .forms import VotingForm
from companies.views import PERMISSION_DENIED, NO_CONTENT, CREATED
from event.models import Event, EventUserAssignment

import json
from datetime import datetime


class VotingView(View):

    def get(self, request, event_id, voting_id=None):
        event = Event.get_by_id(event_id)
        if not voting_id:
            response = [voting.to_dict(request.user) for voting in event.votings.all()]
            if not response:
                return HttpResponse(status=404)
            return JsonResponse({"{} votings".format(event.title): response}, status=200)

        voting = Voting.get_by_id(voting_id)
        if not voting:
            return HttpResponse(status=404)
        return JsonResponse({"{} voting".format(event.title): voting.to_dict(request.user)})

    def delete(self, request, event_id, voting_id):
        voting = Voting.get_by_id(voting_id)
        if not voting:
            return HttpResponse(status=404)
        event = Event.get_by_id(event_id)
        if request.user.id != event.owner_id:
            return PERMISSION_DENIED
        voting.delete()
        return NO_CONTENT

    def post(self, request, event_id):
        event = Event.get_by_id(event_id)
        if not event:
            return HttpResponse(status=404)
        if request.user.id != event.owner.id:
            return PERMISSION_DENIED
        voting_data = json.loads(request.body.decode())
        voting_validation_form = VotingForm(voting_data)
        errors = voting_validation_form.errors
        type_error = VotingView._validate_uniqueness(voting_data['type'], event)
        if type_error:
            errors['type'] = [type_error]
        if voting_data['choices']:
            choice_errors = VotingView._validate_choice_errors(voting_data)
            errors.update(choice_errors)
        if not voting_validation_form.is_valid() or errors:
            return JsonResponse({'success': False, 'errors': errors}, status=400)
        voting = Voting.objects.create(
            title=voting_data['title'],
            description=voting_data['description'],
            type=voting_data['type'],
            event=event,
            end_date=voting_data['end_date']
        )
        for choice in voting_data['choices']:
            voting.choices.create(value=choice, voting=voting)
        return CREATED

    @staticmethod
    def _validate_uniqueness(voting_type, event):
        if voting_type == 'date' or voting_type == 'place':
            event_votings = event.votings.all()
            for voting in event_votings:
                if voting.type == voting_type:
                    return "Only one voting with type '{}' per event is allowed".format(voting_type)

    @staticmethod
    def _validate_choice_errors(voting_data):
        choice_errors = {}
        for i, choice in enumerate(voting_data['choices']):
            key, error, choice_json = VotingView._prepare_data(i, choice)
            choice_error = None
            if voting_data['type'] == 'date':
                choice_error = VotingView._validate_date(key, error, choice_json)
            if voting_data['type'] == 'place':
                choice_error = VotingView._validate_place(key, error, choice_json)
            if voting_data['type'] == 'custom':
                choice_error = VotingView._validate_custom(key, error, choice_json)
            if choice_error:
                choice_errors.update(choice_error)
        return choice_errors

    @staticmethod
    def _validate_date(key, error, choice_json):
        time_now = datetime.now().timestamp()
        if 'start_date' not in choice_json.keys() or not choice_json['start_date']:
            error[key].append("'start_date' is required.")
        if 'end_date' not in choice_json.keys() or not choice_json['end_date']:
            error[key].append("'end_date' is required.")
        if error[key]:
            return error
        try:
            start_date = float(choice_json['start_date'])
            if start_date < time_now:
                error[key].append("'start_date' can not be earlier than now.")
        except ValueError:
            error[key].append("Enter valid 'start_date'")
        try:
            end_date = float(choice_json['end_date'])
            if end_date < time_now:
                error[key].append("'end_date' can not be earlier than now.")
        except ValueError:
            error[key].append("Enter valid 'end_date'")
        if error[key]:
            return error

    @staticmethod
    def _validate_place(key, error, choice_json):
        if 'x_coordinate' not in choice_json.keys() or not choice_json['x_coordinate']:
            error[key].append("'x_coordinate' is required.")
        if 'y_coordinate' not in choice_json.keys() or not choice_json['y_coordinate']:
            error[key].append("'y_coordinate' is required.")

        if error[key]:
            return error

        if 'place' not in choice_json.keys() or not choice_json['place']:
            error[key].append("'place' is required.")
        try:
            float(choice_json['x_coordinate'])
        except ValueError:
            error[key].append('Enter valid x coordinate')
        try:
            float(choice_json['y_coordinate'])
        except ValueError:
            error[key].append('Enter valid y coordinate')

        if error[key]:
            return error

    @staticmethod
    def _validate_custom(key, error, choice_json):
        if 'value' not in choice_json.keys() or not choice_json['value']:
            error[key].append("'value' is required.")
        if error[key]:
            return error

    @staticmethod
    def _prepare_data(i, choice):
        key = 'choice #{}'.format(i + 1)
        error = {key: []}
        choice_json = json.loads(choice.replace("'", "\""))
        return key, error, choice_json


class ChoiceView(View):
    
    def post(self, request, event_id, voting_id, choice_id):
        user = User.get_by_id(request.user.id)
        event = Event.get_by_id(event_id)
        voting = Voting.get_by_id(voting_id)
        if not EventUserAssignment.get_by_event_user(event, user) or not voting:
            return PERMISSION_DENIED
        choice = Choice.get_by_id_voting(choice_id, voting)
        if not choice:
            return PERMISSION_DENIED
        obj, created = VotingUserAssignment.objects.get_or_create(user=user, voting=voting)
        if not created:
            return PERMISSION_DENIED
        ChoiceUserAssignment.objects.create(user=user, choice=choice)
        choice.votes_count = ChoiceUserAssignment.objects.filter(choice=choice).__len__()
        choice.save()
        return JsonResponse({"success": True}, status=200)
