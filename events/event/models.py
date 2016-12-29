from django.db import models
from registration.models import User
from django.db.models.fields.related import ManyToManyField
from django.contrib.postgres.fields import ArrayField
from pytz import utc as TZ
from datetime import datetime


class Event(models.Model):
    title = models.CharField(max_length=200)
    start_date = models.DateTimeField(blank=False)
    end_date = models.DateTimeField(blank=False)
    location = ArrayField(base_field=models.FloatField(), size=2)
    place = models.CharField(max_length=200, blank=False)
    description = models.TextField(blank=False)
    created_date = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, null=False, related_name='owner')
    participants = models.ManyToManyField(
        User,
        through='EventUserAssignment',
        through_fields=('event', 'user'),
    )

    def __str__(self):
        return "%s" % self.title


    def serialize(self):
        return {
            "id" : self.pk,
            "title" : self.title,
            "start_date" : self.start_date,
            "end_date" : self.end_date,
            "description" : self.description,
            "location" : self.location
        }

    @staticmethod
    def get_by_id(event_id):
        try:
            return Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return None

    def to_dict(self):
        opts = self._meta
        data = {}
        for f in opts.concrete_fields + opts.many_to_many:
            if isinstance(f, ManyToManyField):
                if self.pk is None:
                    data[f.name] = []
                else:
                    data[f.name] = [user.to_dict() for user in f.value_from_object(self)]
            else:
                data[f.name] = f.value_from_object(self)
        data['start_date'] = data['start_date'].timestamp()
        data['end_date'] = data['end_date'].timestamp()
        data['created_date'] = data['created_date'].timestamp()
        user = User.get_by_id(data['owner'])
        data['owner'] = {
            'id': user.id,
            'username': '{} {}'.format(user.first_name, user.last_name)
        }
        return data


class EventUserAssignment(models.Model):
    class Meta():
        ordering = ['-event__start_date']
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    @staticmethod
    def get_by_event_user(event, user):
        try:
            return EventUserAssignment.objects.get(user=user, event=event)
        except (EventUserAssignment.DoesNotExist, EventUserAssignment.MultipleObjectsReturned):
            return None
