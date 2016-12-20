import json
import datetime
from threading import Thread
from django.http import JsonResponse, HttpResponse
from django.views.generic.base import View

from datetime import datetime
from pytz import utc as TZ

from .models import Event, EventUserAssignment, User
from companies.models import TeamUserAssignment
from .forms import EventCreateForm
from utils.EmailService import EmailSender



EVENT_NOT_EXISTS = JsonResponse({"error_message": "Such event does not exists"}, status=404)
PERMISSION_DENIED = JsonResponse({"error_message": "Permission denied"}, status=403)
INVALID_PAYLOAD = JsonResponse({"error_message": "Invalid payload"}, status=400)


class EventView(View):
    def get(self, request, event_id=None):
        if not request.user.is_authenticated:
            return PERMISSION_DENIED
        if not event_id:
            if request.GET.get('q'):
                query_date = TZ.localize(datetime.utcfromtimestamp(float(request.GET.get('q'))))
                eus = EventUserAssignment.objects.filter(event__start_date__lte=query_date)[:10]
                response = [item.event.to_dict() for item in eus]
                return JsonResponse(response, safe=False)
            eus = EventUserAssignment.objects.filter(user=request.user.id)
            response = {'events': [item.event.to_dict() for item in eus[:50]], 'number': len(eus)}
            return JsonResponse(response)
        event = Event.get_by_id(event_id)
        if event:
            response = event.to_dict()
            response['is_owner'] = event.owner_id == request.user.id
            return JsonResponse(response)
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
        form = EventCreateForm(event_data)
        if form.is_valid():
            form.cleaned_data['owner'] = user
            event = Event.objects.create(**form.cleaned_data)
            try:
                EventUserAssignment.objects.create(user=user, event=event)
            except:
                return JsonResponse({"error_message": "Can not create relation between user and event"}, status=401)
            return JsonResponse({'message': "Event created successfully", "event_id": event.id}, status=200)
        return JsonResponse(json.loads(form.errors.as_json()), status=400)

    def put(self, request, event_id):
        user = request.user
        event = Event.get_by_id(event_id)
        data_update = json.loads(request.body.decode('utf-8'))
        if not event:
            return EVENT_NOT_EXISTS
        if user.id != event.owner.id:
            return PERMISSION_DENIED
        form = EventCreateForm(data_update)
        if not form.is_valid():
            return JsonResponse(json.loads(form.errors.as_json()), status=400)
        Event.objects.filter(id=event_id).update(**form.cleaned_data)
        return JsonResponse({"message": "Updated"}, status=200)

    def delete(self, request, event_id):
        event = Event.get_by_id(event_id)
        if not request.user.is_authenticated and event.owner.id != request.user.id:
            return PERMISSION_DENIED
        if not event:
            return EVENT_NOT_EXISTS
        event.delete()
        return JsonResponse({'message': "Event delete successfully"}, status=200)


class EventUserAssignmentView(View):
    """
    View used for user assignment to event.
    """
    def get(self, request, event_id):
        event = Event.get_by_id(event_id)
        error = self.__check_rights_existence(request.user, event)
        if error:
            return error
        users_to_add = self.__get_users_to_add_list(request.user, event)
        return JsonResponse({"participants": users_to_add}, status=200)

    def put(self, request, event_id):
        event_participants = json.loads(request.body.decode())
        user_to_add = []
        event = Event.get_by_id(event_id)
        error = self.__check_rights_existence(request.user, event)
        if error:
            return error
        able_to_add = self.__get_users_to_add_list(request.user, event)
        if not event_participants.get('members_to_add'):
            return INVALID_PAYLOAD
        for user_object in event_participants.get('members_to_add'):
            if user_object not in able_to_add:
                return INVALID_PAYLOAD
            user = User.get_by_id(user_object['id'])
            if not user:
                return INVALID_PAYLOAD
            user_to_add.append(user)
        for user in user_to_add:
            EventUserAssignment.objects.get_or_create(user=user, event=event)
        self.__send_invites(user_to_add, event)
        return HttpResponse(status=204)

    def __get_users_to_add_list(self, user, event):
        available_teams = TeamUserAssignment.get_all_teams(user)
        if not available_teams:
            return []
        users_to_add = []
        for team in available_teams:
            users = team.members.all()
            users_to_add.extend([user.to_dict() for user in users
                                 if not self.__check_participation(user, event)
                                 and user.to_dict() not in users_to_add])
        return users_to_add

    def __check_participation(self, user, event):
        return EventUserAssignment.get_by_event_user(event, user)

    def __check_rights_existence(self, user, event):
        if not event:
            return EVENT_NOT_EXISTS
        if not self.__check_participation(user, event):
            return PERMISSION_DENIED
        return None

    def __send_invites(self, users_list, event):
        recipient_list = [user.username for user in users_list]
        thread = Thread(target=EmailSender.send_event_invite, args=(event, recipient_list, 'Event invite'))
        thread.daemon = True
        thread.start()
