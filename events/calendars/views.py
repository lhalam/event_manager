from django.views.generic.base import View
from django.http import JsonResponse
from django.core import serializers
from django.http.response import HttpResponseForbidden
from event.models import User, EventUserAssignment, Event

class Calendar(View):
    """
    The view, which return all events for the authenticated user
    """
    def get(self, request):
        if request.user.is_authenticated:

            user_id = request.user.id

            user_events = []
            try:
                event_user_assignments = EventUserAssignment.objects.filter(user=user_id)
                events = [i.event for i in event_user_assignments]
                user_events.append(serializers.serialize('json', events, fields = ('title', 'start_date', 'end_date')))
            except ValueError:
                return JsonResponse({ 'Bad request' }, status=400)

            return JsonResponse({ 'user_events': user_events }, status=200)

        else:
            return HttpResponseForbidden('Permission denied')
