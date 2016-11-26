from django.db import models
from django.contrib.postgres.fields import ArrayField

from event.models import Event
from registration.models import User


class Voting(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    voting_end = models.DateTimeField(blank=False)
    type = models.CharField(max_length=20, blank=False)
    creation_date = models.DateTimeField(auto_now_add=True)
    event = models.ForeignKey(
        Event,
        null=False,
        related_name='votings',
        related_query_name='voting'
    )
    voters = models.ManyToManyField(
        User,
        through='VotingUserAssignment',
        through_fields=('voting', 'user'),
    )

    def __str__(self):
        return '{}'.format(self.title)


class VotingUserAssignment(models.Model):
    voting = models.ForeignKey(Voting, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class Choice(models.Model):
    voting = models.ForeignKey(
        Voting,
        null=False,
        related_name='choices',
        related_query_name='choice'
    )
    votes_count = models.IntegerField(default=0)
    voters = models.ManyToManyField(
        User,
        through='ChoiceUserAssignment',
        through_fields=('choice', 'user')
    )

    def __str__(self):
        return '{}: {}, count = {}'.format(self.voting.title, self.id, self.votes_count)

    date = ArrayField(base_field=models.DateTimeField(blank=True), size=2, blank=True)

    location = ArrayField(base_field=models.FloatField(), size=2, blank=True)
    place = models.CharField(max_length=200, blank=True)

    custom_value = models.CharField(max_length=200, blank=True)


class ChoiceUserAssignment(models.Model):
    choice = models.ForeignKey(Choice, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
