from django.views.generic.base import View
from django.http.response import JsonResponse, HttpResponse

from .models import Voting
from event.models import Event


class VotingView(View):
    def get(self, request, event_id, voting_id=None):
        event = Event.get_by_id(event_id)
        if not voting_id:
            response = [{
                "id": voting.id,
                "title": voting.title,
                "seconds_left": voting.end_date,
                "choices": [{
                    "id": choice.id,
                    "date": choice.date,
                    "votes": choice.votes_count,
                    "voters": [voter.username for voter in choice.voters.all()]
                            } for choice in voting.choices.all()]
            } for voting in event.votings.all()]
            if response:
                return JsonResponse({"{} votings".format(event.title): response}, status=200)
            else:
                return HttpResponse(status=404)
        voting = Voting.objects.get(pk=voting_id)
        return JsonResponse({"{} voting".format(event.title): {
                "id": voting.id,
                "title": voting.title,
                "seconds_left": voting.end_date,
                "choices": [{
                    "id": choice.id,
                    "date": choice.date,
                    "votes": choice.votes_count,
                    "voters": [voter.username for voter in choice.voters.all()]
                            } for choice in voting.choices.all()]
            }})
