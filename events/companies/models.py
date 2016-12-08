from django.db import models
from registration.models import User

class Company(models.Model):
    name = models.CharField(max_length=50, null=False)
    description = models.TextField(max_length=500, null=True, blank=True)
    admin = models.OneToOneField(User)

    def __str__(self):
        return '{}'.format(self.name)

    @staticmethod
    def get_all():
        return Company.objects.all()

    @staticmethod
    def get_by_id(company_id):
        try:
            return Company.objects.get(pk=company_id)
        except Company.DoesNotExist:
            return None

    @staticmethod
    def to_dict(company):
        return {
            "id": company.id,
            "name": company.name,
            "description": company.description,
            "admin": {
                'id': company.admin.id,
                'username': company.admin.username,
                'first_name': company.admin.first_name,
                'last_name': company.admin.last_name,
            },
        }

    @staticmethod
    def get_teams(company_id):
        return [team for team in Company.get_by_id(company_id).teams.all()]

    @staticmethod
    def get_user_company(user):
        company = Company.objects.filter(admin=user).first()
        if company:
            return company
        first_instance = TeamUserAssignment.objects.filter(user=user).first()
        if first_instance:
            return first_instance.team.company
        return None

    @staticmethod
    def is_admin(user):
        try:
            return Company.objects.get(admin=user)
        except :
            return False


class Team(models.Model):
    name = models.CharField(max_length=50, null=False)
    company = models.ForeignKey(
        Company,
        related_name='teams',
        related_query_name='team',
        null=True)
    members = models.ManyToManyField(
        User,
        through='TeamUserAssignment',
        through_fields=('team', 'user'),
    )
    admin = models.OneToOneField(User, related_name="ruled_team")

    def __str__(self):
        return '{}'.format(self.name)

    @staticmethod
    def get_all():
        return Team.objects.all()

    @staticmethod
    def get_by_id(team_id):
        try:
            return Team.objects.get(pk=team_id)
        except Team.DoesNotExist:
            return None

    @staticmethod
    def to_dict(team):
        return {
            'id': team.id,
            'name': team.name,
            'company': {
                'id': team.company.id,
                'name': team.company.name,
            }
        }

    @staticmethod
    def get_members(current_team):
        members = []
        instances = TeamUserAssignment.objects.filter(team=current_team)
        for instance in instances:
            user_object = {
                "id": instance.user.id,
                "first_name": instance.user.first_name,
                "last_name": instance.user.last_name,
                "username": instance.user.username
            }
            members.append(user_object)
        return members

    @staticmethod
    def remove_user_from_team(team, user):
        TeamUserAssignment.objects.filter(team=team, user=user).delete()
        return Team.get_members(team)


class TeamUserAssignment(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    @staticmethod
    def get_by_user_team(user, team):
        try:
            return TeamUserAssignment.objects.get(user=user, team=team)
        except TeamUserAssignment.DoesNotExist:
            return None

    @staticmethod
    def get_all_teams(user):
        try:
            company = Company.objects.get(admin=user)
            return company.teams.all()
        except Company.DoesNotExist:
            try:
                return TeamUserAssignment.objects.get(user=user).team.company.teams.all()
            except TeamUserAssignment.DoesNotExist:
                return None

    @staticmethod
    def get_user_teams(user):
        try:
            company = Company.objects.get(admin=user)
            return [team for team in company.teams.all()]
        except Company.DoesNotExist:
            try:
                return [tua.team for tua in TeamUserAssignment.objects.filter(user=user)]
            except TeamUserAssignment.DoesNotExist:
                return None
