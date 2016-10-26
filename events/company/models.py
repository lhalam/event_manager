from django.db import models
from django.contrib.auth.models import User


class Company(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(max_length=500)
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
    def create_company(data):
        data['company_admin'] = User.objects.get(username=data.get('company_admin'))
        instance = Company(**data)
        instance.save()

    @staticmethod
    def delete_company(company_id):
        Company.objects.get(id=company_id).delete()


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


class TeamUserAssignment(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
