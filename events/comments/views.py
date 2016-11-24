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
        comments = Comment.objects.filter(event_id=id).order_by('date_add')
        response = [comment.to_dict() for comment in comments]
        return HttpResponse(json.dumps(response), content_type="text/json")

    def post(self, request, id=None):
        body_requst = json.loads(request.body.decode("utf-8"))
        data = {}
        data["text"] = body_requst["text"]
        data["author"] = User.get_by_id(request.user.id)
        if id:
            data["event"] = Event.get_by_id(id)
        else:
            data["parrent_comment"] = Comment.get_by_id(body_requst["parrent_id"])
        form = CommentForm(data)
        if not form.is_valid():
            return HttpResponse(form.errors.as_json(), content_type="text/json", status=400)
        Comment.objects.create(**data)
        return HttpResponse('Ok')

    def delete(self, request, id=None):
        if not request.user:
            return HttpResponse('Permission denied', status=403)
        try:
            Comment.objects.get(id=id).delete()
        except:
            return HttpResponse('Not Found', status=404)
        return HttpResponse('Ok')
