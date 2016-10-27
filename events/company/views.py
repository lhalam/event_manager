import json

from django.views.generic.base import View
from django.http import HttpResponse, JsonResponse

from .forms import CompanyForm, TeamForm
from .models import Company, TeamUserAssignment, Team, User


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
        new_company_data = json.loads(request.body.decode())
        company_form = CompanyForm(new_company_data)
        if not company_form.is_valid():
            return JsonResponse({'success': False,
                                 'errors': company_form.errors}, status=400)
        if not new_company_data.get('company_admin'):
            return JsonResponse({'success': False,
                                 'errors': {
                                     "company_admin": ['This field is required']
                                 }
                                 }, status=400)
        try:
            user = User.objects.get(username=new_company_data.get('company_admin'))
        except User.DoesNotExist:
            return JsonResponse({"error_message": "Such user does not exists"}, status=404)
        if Company.objects.filter(company_admin=user):
            return JsonResponse({'success': False,
                                 'errors': {
                                     "company_admin": ['This user is already an admin of another company']
                                 }
                                 }, status=400)
        new_company_data['company_admin'] = user
        company = Company(**new_company_data)
        company.save()

        return JsonResponse({'success': True}, status=201)

    def put(self, request, company_id):
        upd_company_data = json.loads(request.body.decode())
        company = Company.get_by_id(company_id)
        if not company:
            return JsonResponse({"error_message": "Such company does not exists"}, status=404)

        company_form = CompanyForm(upd_company_data)
        if not company_form.is_valid():
            return JsonResponse({'success': False,
                                 'errors': company_form.errors}, status=400)
        if upd_company_data.get('company_admin'):
            user = User.objects.get(username=upd_company_data.get('company_admin'))
            if Company.objects.filter(company_admin=user):
                return JsonResponse({'success': False,
                                     'errors': {
                                         "company_admin": ['This user is already an admin of another company']
                                     }
                                     }, status=400)
            upd_company_data['company_admin'] = user
        company = Company(**upd_company_data)
        company.save()
        return JsonResponse({'success': True}, status=201)

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
        new_team_data = json.loads(request.body.decode())
        team_form = TeamForm(new_team_data)
        if not team_form.is_valid():
            return JsonResponse({'success': False,
                                 'errors': team_form.errors}, status=400)
        team = Team(
            name=new_team_data.get('name'),
            company=Company.get_by_id(company_id)
        )
        team.save()
        if new_team_data.get('members'):
            for username in new_team_data.get('members'):
                user = User.objects.get(username=username)
                TeamUserAssignment(user=user, team=team).save()
        return JsonResponse({'success': True}, status=201)

    def delete(self, request, company_id, team_id):
        Team.get_by_id(team_id).delete()
        return HttpResponse(status=204)

    def put(self, request, company_id, team_id):
        upd_team_data = json.loads(request.body.decode())
        team_form = TeamForm(upd_team_data)
        if not team_form.is_valid():
            return JsonResponse({'success': False,
                                 'errors': team_form.errors}, status=400)
        team = Team.get_by_id(team_id)
        if not team:
            return JsonResponse({"error_message": "Such team does not exists"}, status=404)
        team.name = upd_team_data.get('name')
        team.save()
        return JsonResponse({'success': True}, status=201)


class TeamUserAssignmentView(View):
    def put(self, request, company_id, team_id):
        team_members = json.loads(request.body.decode())
        not_existing_users = []
        successfully_added = []
        team = Team.get_by_id(team_id)
        if not team:
            return JsonResponse({"error_message": "Such team does not exists"}, status=404)
        if not team_members.get('members'):
            return JsonResponse({"error_message": "Not given any members"}, status=400)
        for username in team_members.get('members'):
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                not_existing_users.append(username)
                continue
            instance, added = TeamUserAssignment.objects.get_or_create(user=user, team=team)
            if added:
                successfully_added.append(user.username)
        if not_existing_users:
            return JsonResponse({
                "not_existing_users": not_existing_users,
                "successfully_added": successfully_added,
            }, status=207)

        return JsonResponse({"successfully_added": successfully_added}, status=200)
