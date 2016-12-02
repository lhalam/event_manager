import uuid

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User as BaseUser
from django.core.exceptions import PermissionDenied

import datetime
from datetime import timedelta

INVITE_DAYS_TTL = 7
IP_BAN_TTL = 60 * 5
MAX_REQUESTS_COUNT = 10


class User(BaseUser):

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


class BannedIP(models.Model):
    ip = models.GenericIPAddressField(protocol='both', unpack_ipv4=True)
    added = models.DateTimeField(null=True)
    requests_count = models.IntegerField(default=1)

    @staticmethod
    def check_ip(ip):
        try:
            current_ip = BannedIP.objects.get(ip=ip)
            if current_ip.added and current_ip.added + timedelta(seconds=IP_BAN_TTL) < timezone.now():
                current_ip.delete()
                return True

            if current_ip.requests_count < MAX_REQUESTS_COUNT:
                current_ip.requests_count += 1
                current_ip.save()
                return True

            if current_ip.requests_count == MAX_REQUESTS_COUNT:
                current_ip.added = timezone.now()
            current_ip.requests_count += 1
            current_ip.save()
            return False

        except models.ObjectDoesNotExist:
            BannedIP.objects.create(ip=ip)
            return True

    @staticmethod
    def clean_ip(ip):
        try:
            BannedIP.objects.get(ip=ip).delete()
        except:
            pass