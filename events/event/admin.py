from django.contrib import admin
from .models import Event, EventUserAssignment


class EventModelAdmin(admin.ModelAdmin):
    list_display = ['title']
    list_display_links = ['title']
    search_fields = ['title']


class EventUserAssignmentModelAdmin(admin.ModelAdmin):
    list_display = ['user', 'event']
    list_display_links = ['user', 'event']
    search_fields = ['user', 'event']

# Register your models here.
admin.site.register(Event, EventModelAdmin)
admin.site.register(EventUserAssignment, EventUserAssignmentModelAdmin)
