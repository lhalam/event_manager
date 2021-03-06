import json

from django.views.generic.base import View
from django.http import JsonResponse

from .forms import CompanyForm, TeamForm
from .models import Company, TeamUserAssignment, Team, User
from events.views import PERMISSION_DENIED, INVALID_PAYLOAD, NO_CONTENT, CREATED

COMPANY_NOT_EXISTS = JsonResponse({"error_message": "Such company does not exists"}, status=404)
TEAM_NOT_EXISTS = JsonResponse({"error_message": "Such team does not exists"}, status=404)


class CompanyView(View):

    def get(self, request, company_id=None):
        if not company_id:
            company = Company.get_user_company(request.user)
            if not request.user.is_superuser and not company:
                return PERMISSION_DENIED
            if request.user.is_superuser:
                companies = Company.get_all()
                response = {"companies": [Company.to_dict(company) for company in companies]}
            else:
                response = {"companies": [Company.to_dict(company)]}
            response['role'] = User.get_by_id(request.user.id).get_role_id(company)
            return JsonResponse(response, status=200)

        company = Company.get_by_id(company_id)
        if not company:
            return COMPANY_NOT_EXISTS
        if Company.get_user_company(request.user) != company and not request.user.is_superuser:
            return PERMISSION_DENIED
        response = Company.to_dict(company)
        response['teams'] = [Team.to_dict(team) for team in Company.get_teams(company_id)]
        response['role'] = User.get_by_id(request.user.id).get_role_id(company)
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
        company = Company.objects.create(**new_company_data)
        return JsonResponse(Company.to_dict(company), status=201)

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
        if Company.get_user_company(request.user) != company and not request.user.is_superuser:
            return PERMISSION_DENIED
        if not team_id:
            response = [{
                'id': team.pk,
                'name': team.name,
                'company': company.name,
                'members': Team.get_members(team)[:4],
                'admin': team.admin.to_dict()
            } for team in company.teams.all()]
            return JsonResponse(response, safe=False, status=200)

        team = Team.get_by_id(team_id)
        if not team:
            return TEAM_NOT_EXISTS
        if team.company.id != company.id:
            return PERMISSION_DENIED
        if Company.get_user_company(request.user) != company and not request.user.is_superuser:
            return PERMISSION_DENIED
        response = {
            'id': team.pk,
            'name': team.name,
            'company': company.name,
            'members': Team.get_members(team),
            'admin': team.admin.to_dict(),
            'role': User.get_by_id(request.user.id).get_role_id(company, team)
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
        errors = team_form.errors
        if 'admin' not in errors.keys():
            admin_error = TeamView.validate_team_admin(company, User.get_by_id(new_team_data.get('admin')))
            if admin_error:
                errors['admin'] = [admin_error]
        if not team_form.is_valid() or errors:
            return JsonResponse({'success': False, 'errors': team_form.errors}, status=400)
        team = Team.objects.create(
            name=new_team_data.get('name'),
            company=company,
            admin_id=new_team_data.get('admin')
        )
        TeamUserAssignment.objects.get_or_create(team=team, user_id=new_team_data.get('admin'))
        return JsonResponse({'team_id': team.id}, status=201)

    def put(self, request, company_id, team_id):

        existence_error = TeamView.check_company_team_existence(company_id, team_id)
        if existence_error:
            return existence_error
        company = Company.get_by_id(company_id)
        if not TeamView.check_team_rights(request, team_id) and not CompanyView.check_company_rights(request, company):
            return PERMISSION_DENIED
        upd_team_data = json.loads(request.body.decode())
        team_form = TeamForm(upd_team_data)
        errors = team_form.errors
        if 'admin' not in errors.keys():
            admin_error = TeamView.validate_team_admin(company, User.get_by_id(upd_team_data.get('admin')), team_id)
            if admin_error:
                errors['admin'] = [admin_error]
        if not team_form.is_valid() or errors:
            return JsonResponse({'success': False, 'errors': team_form.errors}, status=400)
        Team.objects.filter(pk=team_id).update(**upd_team_data)
        TeamUserAssignment.objects.get_or_create(team_id=team_id, user_id=upd_team_data.get('admin'))
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

    @staticmethod
    def validate_team_admin(company, admin, team_id=None):
        try:
            if team_id:
                if Team.objects.get(admin_id=admin.id).id != int(team_id):
                    return 'This user is already admin of another team'
            else:
                if Team.objects.get(admin_id=admin.id):
                    return 'This user is already admin of another team'
        except Team.DoesNotExist:
            pass
        for company in Company.objects.exclude(pk=company.id):
            for team in company.teams.all():
                if TeamUserAssignment.get_by_user_team(admin, team=team):
                    return 'This user is member of another company'

    @staticmethod
    def check_team_rights(request, team_id):
        return request.user.id == Team.get_by_id(team_id).admin.id

class TeamUserAssignmentView(View):
    def get(self, request, company_id, team_id):
        members = []
        team = Team.get_by_id(team_id)
        if not team:
            return TEAM_NOT_EXISTS
        users = TeamUserAssignmentView.get_users_to_add_list(team, company_id)
        for user in TeamUserAssignmentView.get_users_to_add_list(team, company_id):
            members.append(user.to_dict())

        return JsonResponse({"participants": members}, status=200)

    def put(self, request, company_id, team_id):
        existence_error = TeamView.check_company_team_existence(company_id, team_id)
        if existence_error:
            return existence_error
        company = Company.get_by_id(company_id)
        if not TeamView.check_team_rights(request, team_id) and not CompanyView.check_company_rights(request, company):
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

                return JsonResponse({'able_to_add': able_to_add}, status=200)
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


class CompanyAdminAssignView(View):
    def get(self, request, company_id=None):
        possible_admins = []
        if not company_id:
            possible_admins.extend([user.to_dict() for user in User.get_all_users()
                                    if not Company.get_user_company(user)])
            return JsonResponse({'possible_admins': possible_admins}, status=200)
        company = Company.get_by_id(company_id)
        possible_admins.extend([user.to_dict() for user in User.get_all_users() if not Company.get_user_company(user) or
                                company == Company.get_user_company(user)])
        return JsonResponse({'possible_admins': possible_admins}, status=200)


class TeamAdminAssignView(View):
    def get(self, request, company_id, team_id=None):
        company = Company.get_by_id(company_id)
        if not company:
            return COMPANY_NOT_EXISTS
        possible_admins = []
        if not team_id:
            possible_admins.extend([user.to_dict() for user in User.get_all_users()
                                    if not Company.get_user_company(user)])
            for team in company.teams.all():
                possible_admins.extend([user.to_dict() for user in team.members.all()
                                        if user != team.admin and user.to_dict() not in possible_admins])
            return JsonResponse({'possible_admins': possible_admins}, status=200)
        team = Team.get_by_id(team_id)
        team_admins = [team.admin for team in company.teams.all()]
        possible_admins.extend([user.to_dict() for user in team.members.all() if user not in team_admins])
        possible_admins.extend([team.admin.to_dict()])
        return JsonResponse({'possible_admins': possible_admins}, status=200)
