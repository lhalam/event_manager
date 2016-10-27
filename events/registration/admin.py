from django.contrib import admin
from .models import User, RegistrationConfirm


class UserModelAdmin(admin.ModelAdmin):
    list_display = ['username']
    list_display_links = ['username']
    search_fields = ['username']


class RegistrationConfirmAdmin(admin.ModelAdmin):
    list_display = ['user']
    list_display_links = ['user']
    search_fields = ['user']

admin.site.register(User, UserModelAdmin)
admin.site.register(RegistrationConfirm, RegistrationConfirmAdmin)
