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
        for user_id in event_participants.get('participants'):
            user = User.get_user_by_id(user_id)
            if not user:
                return JsonResponse({"error_message": "Invalid payload"}, status=400)
            able_to_add.append(user)
        for user in able_to_add:
            EventUserAssignment.objects.get_or_create(user=user, event=event)
        return HttpResponse(status=204)
