import json

from django.views.generic.base import View
from django.http import JsonResponse, HttpResponse

from .models import Event, EventUserAssignment, User


class EventView(View):

    pass


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
        for username in event_participants.get('participants'):
            try:
                user = User.objects.get(username=username)
                able_to_add.append(user)
            except User.DoesNotExist:
                able_to_add = []
                break
        if not able_to_add:
            return JsonResponse({"error_message": "Invalid payload"}, status=400)
        for user in able_to_add:
            EventUserAssignment.objects.get_or_create(user=user, event=event)
        return HttpResponse(status=204)
