import json

from django.http import JsonResponse
from django.views.generic.base import View
from .models import Event, EventUserAssignment, User
from .forms import EventValidationForm


class EventView(View):
    def post(self, request):

        try:
            event_data = json.loads(request.body.decode())
        except Exception as e:
            return JsonResponse({
                "json error": e.message,
            }, status=400)

        validation_form = EventValidationForm(event_data)
        if validation_form.is_valid():
            event = Event()
            event.title = validation_form.cleaned_data['title']
            event.start_date = validation_form.cleaned_data['start_date']
            event.end_date = validation_form.cleaned_data['end_date']
            event.location = validation_form.cleaned_data['location']
            event.description = validation_form.cleaned_data['description']
            event.save()

            return JsonResponse({'message': 'Event created successfully'}, status=200)

        return JsonResponse({'errors': validation_form.errors.as_json()}, status=400)


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
