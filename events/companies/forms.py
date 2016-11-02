from django import forms


class CompanyForm(forms.Form):
    name = forms.CharField(max_length=50, required=True)
    description = forms.CharField(max_length=500, required=False)


class CompanyPutForm(forms.Form):
    name = forms.CharField(max_length=50, required=False)
    description = forms.CharField(max_length=500, required=False)


class TeamForm(forms.Form):
    name = forms.CharField(max_length=50, required=True)


class TeamPutForm(forms.Form):
    name = forms.CharField(max_length=50, required=False)
