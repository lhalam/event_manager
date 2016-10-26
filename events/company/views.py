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
            'company_admin': company.company_admin.username,
            'teams': Company.get_teams(company_id)
        }
        return JsonResponse(response, status=200)

    def post(self, request):
        data = json.loads(request.body.decode())
        Company.create_company(data)
        return HttpResponse(status=201)

    def put(self, request, company_id):
        data = json.loads(request.body.decode())

        company = Company.get_by_id(company_id)
        if not company:
            return JsonResponse({"error_message": "Such company does not exists"}, status=404)

        if data.get('company_admin'):
            data['company_admin'] = User.objects.get(username=data.get('company_admin'))
            company.company_admin = data.get('company_admin')
        if data.get('name'):
            company.name = data.get('name')
        if data.get('description'):
            company.description = data.get('description')

        company.save()
        return HttpResponse(status=204)

    def delete(self, request, company_id):
        Company.get_by_id(company_id).delete()
        return HttpResponse(status=204)


class TeamView(View):

    def get(self, request, company_id, team_id=None):

        company = Company.get_by_id(company_id).name

        if not team_id:
            teams = Team.get_all()
            response = [{
                'id': team.pk,
                'name': team.name,
                'company': company,
                'members': Team.get_members(team)[:4]
                         } for team in teams]
            return JsonResponse(response, safe=False, status=200)

        team = Team.get_by_id(team_id)

        if not team:
            return JsonResponse({"error_message": "Such team does not exists"}, status=404)
        response = {
            'id': team.pk,
            'name': team.name,
            'company': company,
            'members': Team.get_members(team)
                    }
        return JsonResponse(response, status=200)

    def post(self, request, company_id):
        data = json.loads(request.body.decode())
        team = Team()
        company = Company.get_by_id(company_id)
        team.name = data.get('name')
        team.company = company
        if data.get('members'):
            team.save()
            for username in data.get('members'):
                user = User.objects.get(username=username)
                TeamUserAssignment(user=user, team=team).save()
            team.members = Team.get_members(team)
            team.save()
        else:
            team.save()
        return HttpResponse(status=201)

    def delete(self, request, company_id, team_id):
        Team.get_by_id(team_id).delete()
        return HttpResponse(status=204)

    def put(self, request, company_id, team_id):
        data = json.loads(request.body.decode())

        team = Team.get_by_id(team_id)
        if not team:
            return JsonResponse({"error_message": "Such team does not exists"}, status=404)

        if data.get('name'):
            team.name = data.get('name')

        team.save()
        return HttpResponse(status=204)


class TeamUserAssignmentView(View):

    def put(self, request, event_id):

        data = json.loads(request.body.decode())
        not_existing_users, successfully_added = [], []

        team = Team.get_by_id(event_id)
        if not team:
            return JsonResponse({"error_message": "Such team does not exists"}, status=404)

        for username in data.get('members'):

            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                not_existing_users.append(username)
                continue

            instance, added = TeamUserAssignment.objects.get_or_create(user=user, team=team)

            if added:
                instance.save()
                successfully_added.append(user.username)

        if not_existing_users:

            return JsonResponse({
                "not_existing_users": not_existing_users,
                "successfully_added": successfully_added,
            }, status=404)

        return JsonResponse({"successfully_added": successfully_added}, status=200)
