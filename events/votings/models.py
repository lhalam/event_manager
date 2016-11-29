from django.db import models

from event.models import Event
from registration.models import User
from django.utils.timezone import utc as timezone

from datetime import datetime
import time


class Voting(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    end_date = models.DateTimeField(blank=False)
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

    def save(self, *args, **kwargs):
        self.end_date = timezone.localize(datetime.fromtimestamp(float(self.end_date)))
        super(self.__class__, self).save(*args, **kwargs)

    def __str__(self):
        return '{}'.format(self.title)

    def to_dict(self, user):
        voters = [{
            'id': vote.user.id,
            'username': vote.user.username,
            'first_name': vote.user.first_name,
            'last_name': vote.user.last_name
        } for vote in VotingUserAssignment.objects.filter(voting=self)]
        return {
            "id": self.pk,
            "title": self.title,
            "description": self.description,
            "end_date": self.end_date,
            "creation_date": self.creation_date,
            "seconds_left": self.end_date.timestamp()-time.time(),
            "type": self.type,
            "choices": [choice.to_dict() for choice in self.choices.all()],
            "voters": voters,
            "voted": VotingUserAssignment.check_vote(user, self),
            "votes": VotingUserAssignment.objects.filter(voting=self).__len__()
        }

    @staticmethod
    def get_by_id(voting_id):
        try:
            return Voting.objects.get(pk=voting_id)
        except Voting.DoesNotExist:
            return None

    @staticmethod
    def get_all(event):
        return Voting.objects.filter(event=event)


class VotingUserAssignment(models.Model):
    voting = models.ForeignKey(Voting, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    @staticmethod
    def check_vote(user, voting):
        try:
            VotingUserAssignment.objects.get(user=user, voting=voting)
            return True
        except VotingUserAssignment.DoesNotExist:
            return False


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
    value = models.TextField(blank=False)
    creation_date = models.DateTimeField(auto_now_add=True)

    def to_dict(self):
        voters = [{
            'id': vote.user.id,
            'username': vote.user.username,
            'first_name': vote.user.first_name,
            'last_name': vote.user.last_name
        } for vote in ChoiceUserAssignment.objects.filter(choice=self)]
        return {
            "id": self.pk,
            "votes": self.votes_count,
            "value": self.value,
            "voters": voters
        }

    @staticmethod
    def get_by_id(choice_id):
        try:
            return Choice.objects.get(pk=choice_id)
        except Choice.DoesNotExist:
            return None


class ChoiceUserAssignment(models.Model):
    choice = models.ForeignKey(Choice, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
