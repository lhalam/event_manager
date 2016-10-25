import uuid

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User as BaseUser
from django.core.exceptions import PermissionDenied

from datetime import datetime, timedelta

INVITE_DAYS_TTL = 7


class User(BaseUser):

    @classmethod
    def get_all_users(cls):
        return cls.objects.all()

    @classmethod
    def get_user_by_id(cls, id):
        try:
            user = cls.objects.get(pk=id)
        except cls.DoesNotExist:
            return None
        else:
            return user


class RegistrationConfirm(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    hash_code = models.CharField(max_length=32, unique=True)
    creation_date = models.DateTimeField(default=datetime.now)
    is_active = models.BooleanField(default=True)

    @staticmethod
    def create_confirm(user):
        """
        Saves hashcode and appropriate user for registration confirm.
        :param user:
        :return link:
        """
        confirm = RegistrationConfirm()
        confirm.user = user
        confirm.hash_code = uuid.uuid4().hex
        confirm.creation_date = datetime.now()
        confirm.is_active = True
        confirm.save()

        return confirm.hash_code

    @staticmethod
    def close_confirm(hash_code):
        """
        Close registration confirm for user.
        :param hash_code:
        :return user:
        :return None:
        """
        try:
            confirm = RegistrationConfirm.objects.get(hash_code=hash_code)
        except RegistrationConfirm.DoesNotExist:
            return None

        if not confirm.is_active:
            raise PermissionDenied

        if confirm.creation_date + timedelta(days=INVITE_DAYS_TTL) < timezone.now():
            confirm.user.delete()
            return None

        confirm.user.is_active = True
        confirm.user.save()
        confirm.is_active = False
        confirm.save()

        return confirm.user
