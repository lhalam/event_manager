import uuid

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User as BaseUser
from django.core.exceptions import PermissionDenied

from datetime import timedelta

INVITE_DAYS_TTL = 7

def min_birth_date():
    return timezone.now().date() + timezone.timedelta(days=-356*18)

class User(BaseUser):
    birth_date = models.DateField(null=False, default=min_birth_date)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name
        }
        
    @classmethod
    def get_all_users(cls):
        return cls.objects.all()

    @classmethod
    def get_by_id(cls, user_id):
        try:
            user = cls.objects.get(pk=user_id)
        except cls.DoesNotExist:
            return None
        else:
            return user

    @classmethod
    def get_nearest_birth_date(cls):
        birth_date = timezone.now().date() + timezone.timedelta(days=7)
        return cls.objects.filter(birth_date__month=birth_date.month - 1, birth_date__day=birth_date.day)


class RegistrationConfirm(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    hash_code = models.UUIDField(default=uuid.uuid4, unique=True)
    creation_date = models.DateTimeField(auto_now_add=True)
    is_closed = models.BooleanField(default=False)

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
            raise PermissionDenied

        if confirm.is_closed:
            raise PermissionDenied

        if confirm.creation_date + timedelta(days=INVITE_DAYS_TTL) < timezone.now():
            confirm.user.delete()
            return None

        confirm.user.is_active = True
        confirm.user.save()
        confirm.is_closed = True
        confirm.save()

        return confirm.user
