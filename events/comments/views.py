from django.shortcuts import render, HttpResponse
from django.views.generic import View
from event.models import Event
from registration.models import User
from .models import Comment
from .forms import CommentForm

import json

# Create your views here.


class CommentView(View):
    def get(self, request, id):
        if not request.user.is_authenticated:
            return HttpResponse('Permission denied', status=403)
        comments = Comment.objects.filter(event_id=id)
        response = [comment.to_dict() for comment in comments]
        return HttpResponse(json.dumps(response), content_type="text/json")

    def post(self, request, id=None):
        pass

    def delete(self, request, id=None):
        if not request.user:
            return HttpResponse('Permission denied', status=403)
        try:
            Comment.objects.get(id=id).delete()
        except:
            return HttpResponse('Not Found', status=404)
        return HttpResponse('Ok')
