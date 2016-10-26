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
        """
        :param request: request to View
        :param event_id: id of event for which users will be assigned
        :return: json containing error message and status 404 if event does not exists.
        json containing two lists: successfully added users; users which do not exist and status 404
        if some of assigned users are not existing.
        json containing list of successfully added users and status 200.
        """
        data = json.loads(request.body.decode())
        not_existing_users, successfully_added = [], []

        event = Event.get_by_id(event_id)
        if not event:
            return JsonResponse({"error_message": "Such event does not exists"}, status=404)

        for username in data.get('participants'):

            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                not_existing_users.append(username)
                continue

            instance, added = EventUserAssignment.objects.get_or_create(user=user, event=event)

            if added:
                instance.save()
                successfully_added.append(user.username)

        if not_existing_users:

            return JsonResponse({
                "not_existing_users": not_existing_users,
                "successfully_added": successfully_added,
            }, status=404)

        return JsonResponse({"successfully_added": successfully_added}, status=200)
