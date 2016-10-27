import json
import datetime

from django.utils.timezone import get_current_timezone
from django.http.response import HttpResponseNotFound
from django.http import JsonResponse, HttpResponse
from django.views.generic.base import View
from django.forms import model_to_dict
from django.core import serializers

from .models import Event, EventUserAssignment, User
from .forms import EventCreateForm

# Variabels for converting string to datetime
tz = get_current_timezone()
format = '%b %d %Y %I:%M%p'

class EventView(View):
    def get(self, request, pk=None):
        if not pk:
            response = serializers.serialize("json", Event.objects.all())
            return HttpResponse(response, content_type="application/json")
        else:
            try:
                event = Event.objects.get(pk=pk)
            except:
                return HttpResponseNotFound('Doesnt not exist')
            else:
                response = model_to_dict(event)
                response['start_date'] = str(event.start_date)
                response['end_date'] = str(event.end_date)
                return HttpResponse(json.dumps(response), content_type="application/json")

    def put(self, request, pk):
        try:
            event = Event.objects.get(id=pk)
        except:
            return HttpResponseNotFound('Doesnt not exist')
        body_unicode = request.body.decode('utf-8')
        data = json.loads(body_unicode)
        data["start_date"] = tz.localize(datetime.datetime.strptime(data["start_date"], format))
        data["end_date"] = tz.localize(datetime.datetime.strptime(data["end_date"], format))
        form = EventCreateForm(data)
        if form.is_valid():
            for k, v in data.items():
                e.__dict__[k] = v
                e.save()
            return HttpResponse('ok')
        else:
            return HttpResponse(json.dumps(form.errors.as_json), content_type="application/json")


class EventUserAssignmentView(View):
    """
    View used for user assignment to event.
    """

    def put(self, request, event_id):
        event_participants = json.loads(request.body.decode())
        not_existing_users = []
        successfully_added = []
        event = Event.get_by_id(event_id)
        if not event:
            return JsonResponse({"error_message": "Such event does not exists"}, status=404)
        if not event_participants.get('participants'):
            return JsonResponse({"error_message": "Not given any participants"}, status=400)
        for username in event_participants.get('participants'):
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                not_existing_users.append(username)
                continue
            instance, added = EventUserAssignment.objects.get_or_create(user=user, event=event)
            if added:
                successfully_added.append(user.username)
        if not_existing_users:
            return JsonResponse({
                "not_existing_users": not_existing_users,
                "successfully_added": successfully_added,
            }, status=207)

        return JsonResponse({"successfully_added": successfully_added}, status=200)
