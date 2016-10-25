from django.db import models
from django.contrib.auth.models import User


class Event(models.Model):
    title = models.CharField(max_length=200)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    location = models.CharField(max_length=200, null=True)
    description = models.TextField(blank=True, null=True)
    participants = models.ManyToManyField(
        User,
        through='EventUserAssignment',
        through_fields=('event', 'user'),
    )

    def __str__(self):
        return "%s" % self.title

    @classmethod
    def get_all(cls):
        return cls.objects.all()

    @classmethod
    def get_by_id(cls, event_id):
        return cls.objects.get(pk=event_id)


class EventUserAssignment(models.Model):
    event = models.ForeignKey(Event)
    user = models.ForeignKey(User)

    # @classmethod
    # def get_current_event_user_list(cls, event_id):
