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
    def get_teams(company_id):
        return [team for team in Company.get_by_id(company_id).teams.all()]

    @staticmethod
    def get_user_company(request):
        company = Company.objects.filter(admin=request.user).first()
        if company:
            return company
        first_instance = TeamUserAssignment.objects.filter(user=request.user).first()
        if first_instance:
            return first_instance.team.company
        return None


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

    @staticmethod
    def get_all_teams(user):
        try:
            return TeamUserAssignment.objects.get(user=user).team.company.teams.all()
        except TeamUserAssignment.DoesNotExist:
            return None
