import json

from django.views.generic.base import View
from django.forms import model_to_dict
from django.http import HttpResponse, JsonResponse

from .forms import CompanyForm, TeamForm
from .models import Company, TeamUserAssignment, Team, User

PERMISSION_DENIED = JsonResponse({"error_message": "Permission denied"}, status=403)
COMPANY_NOT_EXISTS = JsonResponse({"error_message": "Such company does not exists"}, status=404)
TEAM_NOT_EXISTS = JsonResponse({"error_message": "Such team does not exists"}, status=404)
INVALID_PAYLOAD = JsonResponse({"error_message": "Invalid payload"}, status=400)
NO_CONTENT = HttpResponse(status=204)
CREATED = JsonResponse({'success': True}, status=201)


class CompanyView(View):

    def get(self, request, company_id=None):
        if not company_id:
            company = Company.get_user_company(request)
            if not request.user.is_superuser or not company:
                return PERMISSION_DENIED
            if request.user.is_superuser:
                companies = Company.get_all()
                response = {"companies": [model_to_dict(company) for company in companies]}
            else:
                response = {"companies": [model_to_dict(company)]}
            return JsonResponse(response, status=200)

        company = Company.get_by_id(company_id)
        if not company:
            return COMPANY_NOT_EXISTS
        if Company.get_user_company(request) != company and not request.user.is_superuser:
            return PERMISSION_DENIED
        response = model_to_dict(company)
        response['teams'] = [team.name for team in Company.get_teams(company_id)]
        return JsonResponse(response, status=200)

    def post(self, request):
        if not request.user.is_superuser:
            return PERMISSION_DENIED
        new_company_data = json.loads(request.body.decode())
        company_form = CompanyForm(new_company_data)
        errors = company_form.errors
        user = User.get_by_id(new_company_data.get('admin'))
        errors = CompanyView.validate_admin_field(user, errors, new_company_data)
        if not company_form.is_valid() or errors:
            return JsonResponse({'success': False, 'errors': errors}, status=400)
        new_company_data['admin'] = user
        Company.objects.create(**new_company_data)
        return CREATED

    def put(self, request, company_id):
        company = Company.get_by_id(company_id)
        if not company:
            return COMPANY_NOT_EXISTS
        if not CompanyView.check_company_rights(request, company):
            return PERMISSION_DENIED
        upd_company_data = json.loads(request.body.decode())
        company_form = CompanyForm(upd_company_data)
        errors = company_form.errors
        upd_admin = User.get_by_id(upd_company_data.get('admin'))
        if upd_admin and upd_admin != company.admin:
            if not request.user.is_superuser:
                return PERMISSION_DENIED
            errors = CompanyView.validate_admin_field(upd_admin, errors, upd_company_data, company)
        else:
            upd_admin = company.admin
        if not company_form.is_valid() or errors:
            return JsonResponse({'success': False, 'errors': company_form.errors}, status=400)
        upd_company_data['admin'] = upd_admin
        Company.objects.filter(pk=company_id).update(**upd_company_data)
        return CREATED

    def delete(self, request, company_id):
        company = Company.get_by_id(company_id)
        if not CompanyView.check_company_rights(request, company):
            return PERMISSION_DENIED
        company.delete()
        return NO_CONTENT

    @staticmethod
    def check_company_rights(request, company):
        if not request.user.is_superuser:
            return company.admin.id == request.user.id
        return True

    @staticmethod
    def validate_admin_field(user, errors, data, company=None):
        if not data.get('admin'):
            errors['admin'] = ['This field is required']
        elif not user:
            errors['admin'] = ["This user didn't exists"]
        if not company and Company.objects.filter(admin=user):
            errors['admin'] = ['This user is already an admin of another company']
        elif Company.objects.filter(admin=user) and company.admin != user:
            errors['admin'] = ['This user is already an admin of another company']
        return errors


class TeamView(View):

    def get(self, request, company_id, team_id=None):
        company = Company.get_by_id(company_id)
        if not company:
            return COMPANY_NOT_EXISTS
        if Company.get_user_company(request) != company and not request.user.is_superuser:
            return PERMISSION_DENIED
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
            return TEAM_NOT_EXISTS
        if team.company.id != company.id:
            return PERMISSION_DENIED
        if Company.get_user_company(request) != company and not request.user.is_superuser:
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
        if not CompanyView.check_company_rights(request, company):
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
                user = User.get_by_id(user_id)
                if not user:
                    return INVALID_PAYLOAD
                able_to_add.append(user)
            for user in able_to_add:
                TeamUserAssignment.objects.get_or_create(user=user, team=team)
        return CREATED

    def put(self, request, company_id, team_id):
        existence_error = TeamView.check_company_team_existence(company_id, team_id)
        if existence_error:
            return existence_error
        company = Company.get_by_id(company_id)
        if not CompanyView.check_company_rights(request, company):
            return PERMISSION_DENIED
        upd_team_data = json.loads(request.body.decode())
        team_form = TeamForm(upd_team_data)
        if not team_form.is_valid():
            return JsonResponse({'success': False, 'errors': team_form.errors}, status=400)
        Team.objects.filter(pk=team_id).update(**upd_team_data)
        return CREATED

    def delete(self, request, company_id, team_id):
        existence_error = TeamView.check_company_team_existence(company_id, team_id)
        if existence_error:
            return existence_error
        company = Company.get_by_id(company_id)
        if not CompanyView.check_company_rights(request, company):
            return PERMISSION_DENIED
        Team.get_by_id(team_id).delete()
        return NO_CONTENT

    @staticmethod
    def check_company_team_existence(company_id, team_id):
        company = Company.get_by_id(company_id)
        if not company:
            return COMPANY_NOT_EXISTS
        team = Team.get_by_id(team_id)
        if not team:
            return TEAM_NOT_EXISTS
        return None


class TeamUserAssignmentView(View):
    def get(self, request, company_id, team_id):
        members = []
        for user in TeamUserAssignmentView.get_users_to_add_list(Team.get_by_id(team_id), company_id):
            user_object = {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username
            }
            members.append(user_object)

        return JsonResponse({"participants": members}, status=200)

    def put(self, request, company_id, team_id):
        existence_error = TeamView.check_company_team_existence(company_id, team_id)
        if existence_error:
            return existence_error
        company = Company.get_by_id(company_id)
        if not CompanyView.check_company_rights(request, company):
            return PERMISSION_DENIED
        team = Team.get_by_id(team_id)
        new_team_members = json.loads(request.body.decode())
        able_to_add = []
        possible_users = TeamUserAssignmentView.get_users_to_add_list(team, company_id)
        if not new_team_members.get('members_to_add'):
            if not new_team_members.get('member_to_del'):
                return INVALID_PAYLOAD
            else:
                member_to_del = new_team_members.get('member_to_del')
                able_to_add = Team.remove_user_from_team(team, User.get_by_id(member_to_del['id']))

                return JsonResponse({'members_to_del': able_to_add}, status=200)
        else:
            for user in new_team_members.get('members_to_add'):
                user = User.get_by_id(user.get('id'))
                if user not in possible_users:
                    return INVALID_PAYLOAD
                able_to_add.append(user)
            for user in able_to_add:
                TeamUserAssignment.objects.get_or_create(user=user, team=team)
        return NO_CONTENT

    @staticmethod
    def get_users_to_add_list(team, company_id):
        team_members = [member for member in team.members.all()]
        others_companies = Company.get_all().exclude(pk=company_id)
        users_not_to_add = []
        for company in others_companies:
            if company.admin not in users_not_to_add:
                users_not_to_add.append(company.admin)
            for team in company.teams.all():
                for member in team.members.all():
                    if member not in users_not_to_add:
                        users_not_to_add.append(member)

        return [
            user for user in User.get_all_users()
            if user not in team_members and user not in users_not_to_add
            ]
