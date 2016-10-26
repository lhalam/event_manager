from django import forms
from company.models import Company, Team


class CompanyForm(forms.Form):

    name = forms.CharField(max_length=50, required=True)
    description = forms.CharField(max_length=500)


class TeamForm(forms.Form):

    name = forms.CharField(max_length=50, required=True)
