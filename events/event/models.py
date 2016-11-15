from django.db import models
from registration.models import User
from django.db.models.fields.related import ManyToManyField


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
                    data[f.name] = list(f.value_from_object(self).values_list('username', flat=True))
            else:
                data[f.name] = f.value_from_object(self)
        data['start_date'] = str(data['start_date'])
        data['end_date'] = str(data['end_date'])
        return data


class EventUserAssignment(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    @staticmethod
    def get_by_event_user(event, user):
        return EventUserAssignment.objects.filter(user=user, event=event)
