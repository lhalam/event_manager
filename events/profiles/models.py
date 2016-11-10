from __future__ import unicode_literals
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.db.models.signals import post_save
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    photo = models.CharField(max_length=200, default='default_photo.png')
    education = models.TextField(blank = True, default='')
    job = models.TextField(blank = True, default='')

    @classmethod
    def create_user_profile(cls, **kwargs):
        UserProfile.objects.get_or_create(user=kwargs['user'])

    @classmethod
    def get_by_id(cls, profile_id):
        try:
            return cls.objects.get(pk=profile_id)
        except cls.DoesNotExist:
            return None
