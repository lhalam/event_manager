from django import forms
from .models import Company, Team


class CompanyForm(forms.ModelForm):
    class Meta:
        model = Company
        exclude = ['admin']


class TeamForm(forms.ModelForm):
    class Meta:
        model = Team
        exclude = ['members', 'company']
