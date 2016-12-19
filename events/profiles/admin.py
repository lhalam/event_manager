from django.contrib import admin
from .models import UserProfile


class ProfileModelAdmin(admin.ModelAdmin):
    list_display = ['user']
    list_display_links = ['user']
    search_fields = ['user']

admin.site.register(UserProfile, ProfileModelAdmin)
