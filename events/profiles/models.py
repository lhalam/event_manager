from __future__ import unicode_literals
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, primary_key=True)
    bithday = models.DateTimeField()
    homepage = models.URLField()


#def assure_user_profile_exists(pk):
 #   """
  #  Creates a user profile if a User exists, but the
   # profile does not exist.  Use this in views or other
    #places where you don't have the user object but have the pk.
    #"""
    #user = User.objects.get(pk=pk)
    #try:
        # fails if it doesn't exist
   #     userprofile = user.userprofile
  #  except UserProfile.DoesNotExist, e:
 #       userprofile = UserProfile(user=user)
#      userprofile.save()
 #   return


#def create_user_profile(**kwargs):
#    UserProfile.objects.get_or_create(user=kwargs['user'])

#user_registered.connect(create_user_profile)