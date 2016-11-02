import json

from django.views.generic.base import View
from django.http import HttpResponse, JsonResponse
from django.forms import model_to_dict

from .forms import CompanyForm, TeamForm
from .models import Company, TeamUserAssignment, Team, User

MAX_COUNT = 1


class CompanyView(View):

    def get(self, request, company_id=None):
        if not company_id:
            if not request.user.is_superuser:
                return JsonResponse({"error_message": "Permission denied"}, status=403)
            companies = Company.get_all()
            response = [model_to_dict(company) for company in companies]
            return JsonResponse(response, safe=False, status=200)

        company = Company.get_by_id(company_id)
        if not company:
            return JsonResponse({"error_message": "Such company does not exists"}, status=404)
        response = model_to_dict(company)
        response['teams'] = Company.get_teams(company_id)
        return JsonResponse(response, status=200)

    def post(self, request):
        if not request.user.is_superuser:
            return JsonResponse({"error_message": "Permission denied"}, status=403)
        new_company_data = json.loads(request.body.decode())
        company_form = CompanyForm(new_company_data)
        errors = company_form.errors
        if not new_company_data.get('company_admin'):
            errors['company_admin'] = ['This field is required']
        user = User.get_user_by_id(new_company_data.get('company_admin'))
        if not user:
            errors['company_admin'] = ["This user didn't exists"]
        if Company.objects.filter(company_admin=user):
            errors['company_admin'] = ['This user is already an admin of another company']
        if not company_form.is_valid() or errors:
            return JsonResponse({'success': False, 'errors': errors}, status=400)
        # new_company_data['company_admin'] = user
        Company.objects.create(**new_company_data)
        return JsonResponse({'success': True}, status=201)

    def put(self, request, company_id):
        if not request.user.is_superuser:
            return JsonResponse({"error_message": "Permission denied"}, status=403)
        upd_company_data = json.loads(request.body.decode())
        company = Company.get_by_id(company_id)
        if not company:
            return JsonResponse({"error_message": "Such company does not exists"}, status=404)
        company_form = CompanyForm(upd_company_data)
        errors = company_form.errors
        if upd_company_data.get('company_admin'):
            upd_admin = User.get_user_by_id(upd_company_data.get('company_admin'))
            if not upd_admin:
                errors['company_admin'] = ["This user didn't exists"]
            if len(Company.objects.filter(company_admin=upd_admin)) > MAX_COUNT:
                errors['company_admin'] = ['This user is already an admin of another company']
        if not company_form.is_valid() or errors:
            return JsonResponse({'success': False, 'errors': company_form.errors}, status=400)
        Company.objects.filter(pk=company_id).update(**upd_company_data)
        return JsonResponse({'success': True}, status=201)

    def delete(self, request, company_id):
        Company.get_by_id(company_id).delete()
        return HttpResponse(status=204)


class TeamView(View):
    def get(self, request, company_id, team_id=None):
        company = Company.get_by_id(company_id)
        if not team_id:
            response = [{
                            'id': team.pk,
                            'name': team.name,
                            'company': company.name,
                            'members': Team.get_members(team)[:4]
                        } for team in company.teams.all()]
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
            return JsonResponse({'success': False, 'errors': team_form.errors}, status=400)
        team = Team.objects.create(
            name=new_team_data.get('name'),
            company=Company.get_by_id(company_id)
        )
        if new_team_data.get('members'):
            for username in new_team_data.get('members'):
                user = User.objects.get(username=username)
                TeamUserAssignment.objects.create(user=user, team=team).save()
        return JsonResponse({'success': True}, status=201)

    def put(self, request, company_id, team_id):
        upd_team_data = json.loads(request.body.decode())
        team_form = TeamForm(upd_team_data)
        if not team_form.is_valid():
            return JsonResponse({'success': False, 'errors': team_form.errors}, status=400)
        team = Team.get_by_id(team_id)
        if not team:
            return JsonResponse({"error_message": "Such team does not exists"}, status=404)
        team.name = upd_team_data.get('name')
        team.save()
        return JsonResponse({'success': True}, status=201)

    def delete(self, request, company_id, team_id):
        Team.get_by_id(team_id).delete()
        return HttpResponse(status=204)


class TeamUserAssignmentView(View):
    def put(self, request, company_id, team_id):
        team_members = json.loads(request.body.decode())
        able_to_add = []
        team = Team.get_by_id(team_id)
        if not team:
            return JsonResponse({"error_message": "Such team does not exists"}, status=404)
        if not team_members.get('members'):
            return JsonResponse({"error_message": "Not given any members"}, status=400)
        for user_id in team_members.get('members'):
            user = User.get_user_by_id(user_id)
            if not user:
                return JsonResponse({"error_message": "Invalid payload"}, status=400)
            able_to_add.append(user)
        for user in able_to_add:
            TeamUserAssignment.objects.get_or_create(user=user, event=event)
        return JsonResponse({"successfully_added": successfully_added}, status=200)
