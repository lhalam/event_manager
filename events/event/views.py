import json
import datetime

from django.utils.timezone import get_current_timezone
from django.http.response import HttpResponseNotFound, HttpResponseForbidden
from django.http import JsonResponse, HttpResponse
from django.views.generic.base import View

from .models import Event, EventUserAssignment, User
from companies.models import TeamUserAssignment
from .forms import EventCreateForm

# Var for converting string to datetime
TZ = get_current_timezone()
FORMAT = '%b %d %Y %I:%M%p'

EVENT_NOT_EXISTS = JsonResponse({"error_message": "Such event does not exists"}, status=404)
PERMISSION_DENIED = JsonResponse({"error_message": "Permission denied"}, status=403)
INVALID_PAYLOAD = JsonResponse({"error_message": "Invalid payload"}, status=400)


class EventView(View):
    def get(self, request, event_id=None):
        if not request.user.is_authenticated:
            return PERMISSION_DENIED
        if not event_id:
            user_id = request.user.id
            eus = EventUserAssignment.objects.filter(user=user_id)
            response = [item.event.to_dict() for item in eus]
            return HttpResponse(json.dumps(response), content_type="application/json")
        event = Event.get_by_id(event_id)
        if event:
            response = event.to_dict()
            return HttpResponse(json.dumps(response), content_type="application/json")
        else:
            return EVENT_NOT_EXISTS

    def post(self, request):
        if not request.user.is_authenticated:
            return PERMISSION_DENIED
        try:
            event_data = json.loads(request.body.decode())
        except:
            return JsonResponse({"error_message": "Problem with JSON load or decode"}, status=400)
        user = User.get_by_id(request.user.id)
        print(event_data)
        event_data['owner'] = user
        validation_form = EventCreateForm(event_data)
        if validation_form.is_valid():
            event = Event.objects.create(**validation_form.data)
            try:
                EventUserAssignment.objects.create(user=user, event=event)
            except:
                return JsonResponse({"error_message": "Can not create relation between user and event"}, status=401)
            return HttpResponse(event.id)
            return JsonResponse({'message': "Event created successfully"}, status=200)
        print(validation_form.errors.as_json())
        return JsonResponse(json.loads(validation_form.errors.as_json()), status=400)

    def put(self, request, pk):
        try:
            event = Event.objects.get(id=pk)
        except:
            return HttpResponseNotFound('Does not exist')
        body_unicode = request.body.decode('utf-8')
        data = json.loads(body_unicode)
        data["start_date"] = TZ.localize(datetime.datetime.strptime(data["start_date"], FORMAT))
        data["end_date"] = TZ.localize(datetime.datetime.strptime(data["end_date"], FORMAT))
        form = EventCreateForm(data)
        if form.is_valid():
            for k, v in data.items():
                event.to_dict[k] = v
                event.save()
            return HttpResponse('ok')
        else:
            return HttpResponse(json.dumps(form.errors.as_json), content_type="application/json")

    def delete(self, request, event_id):
        if request.user.is_authenticated:
            event = Event.get_by_id(event_id)
            if not event:
                return HttpResponse(status=204)
            if event.owner.id != request.user.id:
                return PERMISSION_DENIED
            event.delete()
            return JsonResponse({'message': "Event delete successfully"}, status=200)
        else:
            return PERMISSION_DENIED


class EventUserAssignmentView(View):
    """
    View used for user assignment to event.
    """
    def get(self, request, event_id):
        event = Event.get_by_id(event_id)
        error = EventUserAssignmentView.check_rights_existence(request.user, event)
        if error:
            return error
        users_to_add = EventUserAssignmentView.get_users_to_add_list(request.user, event)
        return JsonResponse({"participants": users_to_add}, status=200)

    def put(self, request, event_id):
        event_participants = json.loads(request.body.decode())
        user_to_add = []
        event = Event.get_by_id(event_id)
        error = EventUserAssignmentView.check_rights_existence(request.user, event)
        if error:
            return error
        able_to_add = EventUserAssignmentView.get_users_to_add_list(request.user, event)
        if not event_participants.get('participants'):
            return INVALID_PAYLOAD
        for user_object in event_participants.get('participants'):
            if user_object not in able_to_add:
                return INVALID_PAYLOAD
            user = User.get_by_id(user_object['id'])
            if not user:
                return INVALID_PAYLOAD
            user_to_add.append(user)
        for user in user_to_add:
            EventUserAssignment.objects.get_or_create(user=user, event=event)
        return HttpResponse(status=204)

    @staticmethod
    def get_users_to_add_list(user, event):
        available_teams = TeamUserAssignment.get_all_teams(user)
        if not available_teams:
            return []
        users_to_add = []
        for team in available_teams:
            users = team.members.all()
            for user in users:
                user_object = {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "username": user.username
                }
                if not EventUserAssignmentView.check_participation(user, event) and user_object not in users_to_add:
                    users_to_add.append(user_object)
        return users_to_add

    @staticmethod
    def check_participation(user, event):
        return EventUserAssignment.get_by_event_user(event, user)

    @staticmethod
    def check_rights_existence(user, event):
        if not event:
            return EVENT_NOT_EXISTS
        if not EventUserAssignmentView.check_participation(user, event):
            return PERMISSION_DENIED
        return None
