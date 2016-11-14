import json
import datetime

from django.utils.timezone import get_current_timezone
from django.http.response import HttpResponseNotFound, HttpResponseForbidden
from django.http import JsonResponse, HttpResponse
from django.views.generic.base import View

from .models import Event, EventUserAssignment, User
from .forms import EventCreateForm

ERROR_MESSAGE = "error_message"

# Var for converting string to datetime
TZ = get_current_timezone()
FORMAT = '%b %d %Y %I:%M%p'

class EventView(View):
    def get(self, request, pk=None):
        if request.user.is_authenticated:
            if not pk:
                response = []
                user_id = request.user.id
                eus = EventUserAssignment.objects.filter(user=user_id)
                [response.append(i.event.to_dict()) for i in eus]
                return HttpResponse(json.dumps(response), content_type="application/json")
            else:
                try:
                    event = Event.objects.get(pk=pk)
                except:
                    return HttpResponseNotFound('Does not exist')
                else:
                    response = event.to_dict()
                    return HttpResponse(json.dumps(response), content_type="application/json")
        else:
            return HttpResponseForbidden('Permission denied')

    def post(self, request):
        if True:#request.user.is_authenticated:
            try:
                event_data = json.loads(request.body.decode())
            except:
                return JsonResponse({ERROR_MESSAGE: "Problem with JSON load or decode"}, status=400)
            validation_form = EventCreateForm(event_data)
            if validation_form.is_valid():
                event = Event.objects.create(**event_data)
                try:
                    user = User.get_user_by_id(event.owner_id)
                    EventUserAssignment.objects.create(user=user, event=event)
                except:
                    return JsonResponse({ERROR_MESSAGE: "Can not create relation between user and event"}, status=401)
                return JsonResponse({'message': "Event created successfully"}, status=200)
            return JsonResponse({ERROR_MESSAGE: validation_form.errors.as_json()}, status=400)
        else:
            return JsonResponse({ERROR_MESSAGE: "Permission denied"}, status=403)

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
            if event.owner_id != request.user.id:
                return JsonResponse({ERROR_MESSAGE: "Permission denied"}, status=403)
            event.delete()
            return JsonResponse({'message': "Event delete successfully"}, status=200)
        else:
            return JsonResponse({ERROR_MESSAGE: "Permission denied"}, status=403)


class EventUserAssignmentView(View):
    """
    View used for user assignment to event.
    """

    def put(self, request, event_id):
        event_participants = json.loads(request.body.decode())
        able_to_add = []
        event = Event.get_by_id(event_id)
        if not event:
            return JsonResponse({"error_message": "Such event does not exists"}, status=404)
        if not event_participants.get('participants'):
            return JsonResponse({"error_message": "Invalid payload"}, status=400)
        for user_id in event_participants.get('participants'):
            user = User.get_user_by_id(user_id)
            if not user:
                return JsonResponse({"error_message": "Invalid payload"}, status=400)
            able_to_add.append(user)
        for user in able_to_add:
            EventUserAssignment.objects.get_or_create(user=user, event=event)
        return HttpResponse(status=204)
