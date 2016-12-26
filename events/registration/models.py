import uuid

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User as BaseUser
from django.core.exceptions import PermissionDenied

from utils.FileService import FileManager
from datetime import timedelta
from random import choice

INVITE_DAYS_TTL = 7
IP_BAN_TTL = 60 * 5
MAX_REQUESTS_COUNT = 10
AVATAR_BACKGROUND_COLORS = ['#4078c0', '#1abc9c', '#16a085', '#f1c40f', '#f39c12', '#2ecc71',
                            '#27ae60', '#d35400', '#3498db', '#2980b9', '#e74c3c', '#c0392b',
                            '#9b59b6', '#8e44ad', '#bdc3c7', '#34495e', '#2c3e50', '#95a5a6',
                            '#7f8c8d', '#ec87bf', '#d870ad', '#d870ad', '#d870ad', '#b49255']


def min_birth_date():
    return timezone.now().date() + timezone.timedelta(days=-356*18)


class User(BaseUser):
    birth_date = models.DateField(null=False, default=min_birth_date)
    avatar_background = models.CharField(max_length=7)

    def save(self, *args, **kwargs):
        self.avatar_background = choice(AVATAR_BACKGROUND_COLORS)
        super(self.__class__, self).save(*args, **kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'avatar': self.avatar_background,
            'key': self.userprofile.photo,
            'url': FileManager.get_href(self.userprofile.photo)
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

    def get_role_id(self, company=None, team=None):
        if self.is_superuser:
            return 0
        if company and company.admin.id == self.id:
            return 1
        if team and team.admin.id == self.id:
            return 2
        return 3


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
