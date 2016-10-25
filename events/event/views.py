from .models import Event, EventUserAssignment, User
from django.views.generic.base import View
from django.http import HttpResponse
import json


class EventView(View):

    def put(self, request, event_id):
        data = json.loads(request.body.decode())

        if data.get('participants'):
            event = Event.get_by_id(event_id)
            for username in data.get('participants'):
                user = User.objects.get(username=username)
                obj, state = EventUserAssignment.objects.get_or_create(user=user, event=event)
                obj.save()
            return HttpResponse(status=204)

        event = Event.get_by_id(event_id)
        event.title = data.get('title')
        event.description = data.get('description')
        event.save()
        return HttpResponse(status=204)
