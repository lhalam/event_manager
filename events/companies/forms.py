from django import forms


class CompanyForm(forms.Form):

    name = forms.CharField(max_length=50, required=True)
    description = forms.CharField(max_length=500)


class TeamForm(forms.Form):

    name = forms.CharField(max_length=50, required=True)
