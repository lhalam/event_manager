from __future__ import unicode_literals

from registration.models import User
from django.db import models

from utils.FileService import FileManager


class UserProfile(models.Model):
    user = models.OneToOneField(User,
                                on_delete=models.CASCADE,
                                primary_key=True
                                )
    photo = models.CharField(max_length=200, default='default_photo.jpg')
    education = models.CharField(blank=True, max_length=200)
    job = models.CharField(blank=True, max_length=200)

    @classmethod
    def create_user_profile(cls, **kwargs):
        UserProfile.objects.get_or_create(user=kwargs['user'])

    @classmethod
    def get_by_id(cls, profile_id):
        try:
            return cls.objects.get(pk=profile_id)
        except cls.DoesNotExist:
            return None

    def to_dict(self):
        user = User.get_by_id(self.user)
        return {
            'user': user.to_dict(),
            'photo': FileManager.get_href(self.photo),
            'education': self.education,
            'job': self.job,
            'key': self.photo
        }
