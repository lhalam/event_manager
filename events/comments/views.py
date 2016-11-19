from django.shortcuts import render, HttpResponse
from django.views.generic import View
from .models import Comment

import json

# Create your views here.


class CommentView(View):
    def get(self, request, event_id):
        if not request.user.is_authenticated:
            return HttpResponse('Permission denied', status=403)
        comments = Comment.objects.filter(event_id=event_id)
        response = [comment.to_dict() for comment in comments]
        return HttpResponse(json.dumps(response), content_type="text/json")
