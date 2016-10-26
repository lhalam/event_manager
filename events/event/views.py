import json

from django.http import JsonResponse
from django.views.generic.base import View

from .models import Event, EventUserAssignment, User


class EventView(View):

    pass


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
