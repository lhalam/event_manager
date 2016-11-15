from django.contrib import admin
from .models import Company, Team, TeamUserAssignment


class CompanyModelAdmin(admin.ModelAdmin):
    list_display = ['name']
    list_display_links = ['name']
    search_fields = ['name']


class TeamModelAdmin(admin.ModelAdmin):
    list_display = ['name']
    list_display_links = ['name']
    search_fields = ['name']


class TeamUserAssignmentModelAdmin(admin.ModelAdmin):
    list_display = ['team', 'user']
    list_display_links = ['team', 'user']
    search_fields = ['team', 'user']

admin.site.register(Company, CompanyModelAdmin)
admin.site.register(Team, TeamModelAdmin)
admin.site.register(TeamUserAssignment, TeamUserAssignmentModelAdmin)
