# from django.shortcuts import render, reverse
from .models import Company, TeamUserAssignment, Team, User
from django.views.generic.base import View
from django.http import HttpResponse, JsonResponse
import json


class CompanyView(View):

    def get(self, request, company_id=None):
        if not company_id:
            companies = Company.get_all()
            response = [{
                'id': company.pk,
                'name': company.name,
                'description': company.description,
                'company_admin': company.company_admin.username
                         } for company in companies]
            return JsonResponse(response, safe=False, status=200)

        company = Company.get_by_id(company_id)
        if not company:
            return JsonResponse({"error_message": "Such company does not exists"}, status=404)
        response = {
            'id': company.pk,
            'name': company.name,
            'description': company.description,
            'company_admin': company.company_admin.username
        }
        return JsonResponse(response, status=200)

    def post(self, request):
        data = json.loads(request.body.decode())
        Company.create_company(data)
        return HttpResponse(status=201)

    def put(self, request, event_id):
        data = json.loads(request.body.decode())

        if data.get('participants'):
            event = Event.get_by_id(data.get('id'))
            for username in data.get('participants'):
                user = User.objects.get(username=username)
                obj, status = EventUserAssignment.objects.get_or_create(user=user, event=event)
                obj.save()
            return HttpResponse(status=204)

        event = Event.get_by_id(data.get('id'))
        event.title = data.get('title')
        event.description = data.get('description')
        event.save()
        return HttpResponse(status=204)
