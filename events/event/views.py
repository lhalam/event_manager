import json
import datetime

from django.utils.timezone import get_current_timezone
from django.http.response import HttpResponseNotFound, HttpResponseForbidden
from django.http import JsonResponse, HttpResponse
from django.views.generic.base import View

from .models import Event, EventUserAssignment, User
from .forms import EventCreateForm

# Var for converting string to datetime
TZ = get_current_timezone()
FORMAT = '%b %d %Y %I:%M%p'


class EventView(View):
    def get(self, request, pk=None):
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
