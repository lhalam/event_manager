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
    def get_all():
        return Event.objects.all()

    @staticmethod
    def get_by_id(event_id):
        try:
            return Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return None


class EventUserAssignment(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    @staticmethod
    def get_by_user_id(user_id):
        try:
            events = EventUserAssignment.objects.filter(user=user_id)
            print len(events)
            user_events = []
            for event in events:
                    user_events.append(event.event)
            return user_events
        except Event.DoesNotExist:
            return None