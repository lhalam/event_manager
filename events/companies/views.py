import json

from django.views.generic.base import View
from django.forms import model_to_dict
from django.http import HttpResponse, JsonResponse

from .forms import CompanyForm, TeamForm
from .models import Company, TeamUserAssignment, Team, User

PERMISSION_DENIED = JsonResponse({"error_message": "Permission denied"}, status=403)
COMPANY_NOT_EXISTS = JsonResponse({"error_message": "Such company does not exists"}, status=404)
TEAM_NOT_EXISTS = JsonResponse({"error_message": "Such team does not exists"}, status=404)


class CompanyView(View):

    def get(self, request, company_id=None):
        if not company_id:
            if not request.user.is_superuser:
                return PERMISSION_DENIED
            companies = Company.get_all()
            response = [model_to_dict(company) for company in companies]
            return JsonResponse(response, safe=False, status=200)

        company = Company.get_by_id(company_id)
        if not company:
            return COMPANY_NOT_EXISTS
        if Company.get_user_company(request) != company:
            if not request.user.is_superuser:
                return PERMISSION_DENIED
        response = model_to_dict(company)
        response['teams'] = Company.get_teams(company_id)
        return JsonResponse(response, status=200)

    def post(self, request):
        if not request.user.is_superuser:
            return PERMISSION_DENIED
        new_company_data = json.loads(request.body.decode())
        company_form = CompanyForm(new_company_data)
        errors = company_form.errors
        user = User.get_user_by_id(new_company_data.get('company_admin'))
        if not new_company_data.get('company_admin'):
            errors['company_admin'] = ['This field is required']
        else:
            if not user:
                errors['company_admin'] = ["This user didn't exists"]
        if Company.objects.filter(company_admin=user):
            errors['company_admin'] = ['This user is already an admin of another company']
        if not company_form.is_valid() or errors:
            return JsonResponse({'success': False, 'errors': errors}, status=400)
        new_company_data['company_admin'] = user
        Company.objects.create(**new_company_data)
        return JsonResponse({'success': True}, status=201)

    def put(self, request, company_id):
        company = Company.get_by_id(company_id)
        if not company:
            return COMPANY_NOT_EXISTS
        if not CompanyView.check_company_rights(request, company_id):
                return PERMISSION_DENIED
        upd_company_data = json.loads(request.body.decode())
        company_form = CompanyForm(upd_company_data)
        errors = company_form.errors
        if upd_company_data.get('company_admin'):
            if not request.user.is_superuser:
                return PERMISSION_DENIED
            upd_admin = User.get_user_by_id(upd_company_data.get('company_admin'))
            if not upd_admin:
                errors['company_admin'] = ["This user didn't exists"]
            if Company.objects.filter(company_admin=upd_admin) and company.company_admin != upd_admin:
                errors['company_admin'] = ['This user is already an admin of another company']
            upd_company_data['company_admin'] = upd_admin
        if not company_form.is_valid() or errors:
            return JsonResponse({'success': False, 'errors': company_form.errors}, status=400)
        Company.objects.filter(pk=company_id).update(**upd_company_data)
        return JsonResponse({'success': True}, status=201)

    def delete(self, request, company_id):
        company = Company.get_by_id(company_id)
        if not CompanyView.check_company_rights(request, company_id):
                return PERMISSION_DENIED
        company.delete()
        return HttpResponse(status=204)

    @staticmethod
    def check_company_rights(request, company_id):
        company = Company.get_by_id(company_id)
        if not request.user.is_superuser:
            return company.company_admin.id == request.user.id
        return True


class TeamView(View):

    def get(self, request, company_id, team_id=None):
        company = Company.get_by_id(company_id)
        if not company:
            return COMPANY_NOT_EXISTS
        if Company.get_user_company(request) != company:
            if not request.user.is_superuser:
                return PERMISSION_DENIED
        if not team_id:
            response = [{
                            'id': team.pk,
                            'name': team.name,
                            'company': company.name,
                            'members': Team.get_members(team)[:4]
                        } for team in company.teams.all()]
            return JsonResponse(response, safe=False, status=200)

        team = Team.get_by_id(team_id, company_id)
        if not team:
            return TEAM_NOT_EXISTS
        if Company.get_user_company(request) != company:
            if not request.user.is_superuser:
                return PERMISSION_DENIED
        response = {
            'id': team.pk,
            'name': team.name,
            'company': company.name,
            'members': Team.get_members(team)
        }
        return JsonResponse(response, status=200)

    def post(self, request, company_id):
        company = Company.get_by_id(company_id)
        if not company:
            return COMPANY_NOT_EXISTS
        if not CompanyView.check_company_rights(request, company_id):
            return PERMISSION_DENIED
        new_team_data = json.loads(request.body.decode())
        team_form = TeamForm(new_team_data)
        if not team_form.is_valid():
            return JsonResponse({'success': False, 'errors': team_form.errors}, status=400)
        team = Team.objects.create(
            name=new_team_data.get('name'),
            company=company
        )

        if new_team_data.get('members'):
            able_to_add = []
            for user_id in new_team_data.get('members'):
                user = User.get_user_by_id(user_id)
                if not user:
                    return JsonResponse({"error_message": "Invalid payload"}, status=400)
                able_to_add.append(user)
            for user in able_to_add:
                TeamUserAssignment.objects.get_or_create(user=user, team=team)
        return JsonResponse({'success': True}, status=201)

    def put(self, request, company_id, team_id):
        existence_error = TeamView.check_company_team_existence(company_id, team_id)
        if existence_error:
            return existence_error
        if not CompanyView.check_company_rights(request, company_id):
            return PERMISSION_DENIED
        upd_team_data = json.loads(request.body.decode())
        team_form = TeamForm(upd_team_data)
        if not team_form.is_valid():
            return JsonResponse({'success': False, 'errors': team_form.errors}, status=400)
        Team.objects.filter(pk=team_id).update(**upd_team_data)
        return JsonResponse({'success': True}, status=201)

    def delete(self, request, company_id, team_id):
        existence_error = TeamView.check_company_team_existence(company_id, team_id)
        if existence_error:
            return existence_error
        if not CompanyView.check_company_rights(request, company_id):
            return PERMISSION_DENIED
        Team.get_by_id(team_id, company_id).delete()
        return HttpResponse(status=204)

    @staticmethod
    def check_company_team_existence(company_id, team_id):
        company = Company.get_by_id(company_id)
        if not company:
            return COMPANY_NOT_EXISTS
        team = Team.get_by_id(team_id, company_id)
        if not team:
            return TEAM_NOT_EXISTS
        return None


class TeamUserAssignmentView(View):
    def put(self, request, company_id, team_id):
        existence_error = TeamView.check_company_team_existence(company_id, team_id)
        if existence_error:
            return existence_error
        if not CompanyView.check_company_rights(request, company_id):
            return PERMISSION_DENIED
        team = Team.get_by_id(team_id, company_id)
        new_team_members = json.loads(request.body.decode())
        able_to_add = []
        possible_users = TeamUserAssignmentView.get_users_to_add_list(team, company_id)
        if not new_team_members.get('members'):
            return JsonResponse({"error_message": "Not given any members"}, status=400)
        for user_id in new_team_members.get('members'):
            if user_id not in possible_users:
                return JsonResponse({
                    "error_message": "Invalid payload not possible",
                    "possible": possible_users
                }, status=400)
            user = User.get_user_by_id(user_id)
            able_to_add.append(user)
        for user in able_to_add:
            TeamUserAssignment.objects.get_or_create(user=user, team=team)
        return HttpResponse(status=204)

    @staticmethod
    def get_users_to_add_list(team, company_id):
        team_members = [member.id for member in team.members.all()]
        others_companies = Company.get_all().exclude(pk=company_id)
        users_not_to_add = []
        for company in others_companies:
            if company.company_admin_id not in users_not_to_add:
                users_not_to_add.append(company.company_admin_id)
            for team in company.teams.all():
                for member in team.members.all():
                    if member.id not in users_not_to_add:
                        users_not_to_add.append(member.id)
        return [
            user.id for user in User.get_all_users().exclude(pk__in=users_not_to_add)
            if user.id not in team_members
            ]
