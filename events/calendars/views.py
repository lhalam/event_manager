from django.shortcuts import render
from django.views.generic.base import View
from django.http import JsonResponse
import json
from event.models import User, EventUserAssignment, Event

# Create your views here.
class Calendar(View):
    """
    View used .
    """
    def get(self, request, user_id=None):
        if not user_id:
            events = Event.objects.all()
            result = [i.serialize() for i in events]
            return JsonResponse({'all_events': result}, status=200)

        try:
            events = [i.serialize() for i in EventUserAssignment.get_by_user_id(int(user_id))]
        except ValueError:
            return JsonResponse({ 'Bad request' }, status=400)

        return JsonResponse({ 'user_events': events }, status=200)
