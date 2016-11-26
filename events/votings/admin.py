from django.contrib import admin
from .models import Voting, VotingUserAssignment, Choice, ChoiceUserAssignment


class VotingModelAdmin(admin.ModelAdmin):
    list_display = ['title']
    list_display_links = ['title']
    search_fields = ['title']


class ChoiceModelAdmin(admin.ModelAdmin):
    list_display = ['date']
    list_display_links = ['date']
    search_fields = ['date']


class VotingUserAssignmentModelAdmin(admin.ModelAdmin):
    list_display = ['user', 'voting']
    list_display_links = ['user', 'voting']
    search_fields = ['user', 'voting']


class ChoiceUserAssignmentModelAdmin(admin.ModelAdmin):
    list_display = ['user', 'choice']
    list_display_links = ['user', 'choice']
    search_fields = ['user', 'choice']

# Register your models here.
admin.site.register(Voting, VotingModelAdmin)
admin.site.register(Choice, ChoiceModelAdmin)
admin.site.register(VotingUserAssignment, VotingUserAssignmentModelAdmin)
admin.site.register(ChoiceUserAssignment, ChoiceUserAssignmentModelAdmin)
