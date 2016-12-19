from __future__ import unicode_literals

from registration.models import User
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(User,
                                on_delete=models.CASCADE,
                                primary_key=True
                                )
    photo = models.CharField(max_length=200, default='default_photo.jpg')
    education = models.TextField(blank=True, default='')
    job = models.TextField(blank=True, default='')

    @classmethod
    def create_user_profile(cls, **kwargs):
        UserProfile.objects.get_or_create(user=kwargs['user'])

    @classmethod
    def get_by_id(cls, profile_id):
        try:
            return cls.objects.get(pk=profile_id)
        except cls.DoesNotExist:
            return None
