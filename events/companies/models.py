from django.db import models
from registration.models import User


class Company(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(max_length=500, null=True)
    company_admin = models.OneToOneField(User)

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
    def get_teams(company_id):
        return [team.name for team in Company.get_by_id(company_id).teams.all()]


class Team(models.Model):
    name = models.CharField(max_length=50)
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
    def get_members(current_team):
        instances = TeamUserAssignment.objects.filter(team=current_team)
        return [instance.user.username for instance in instances]


class TeamUserAssignment(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
