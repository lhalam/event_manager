from __future__ import unicode_literals
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    photo = models.CharField(max_length=200)
    homepage = models.URLField()

    def create_user_profile(**kwargs):
        UserProfile.objects.get_or_create(user=kwargs['user'])

    def __str__(self):
        return "%s" % self.title

    @staticmethod
    def get_all():
        return UserProfile.objects.all()

    @staticmethod
    def get_by_id(event_id):
        try:
            return UserProfile.objects.get(pk=event_id)
        except UserProfile.DoesNotExist:
            return None
