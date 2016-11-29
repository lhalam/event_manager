from django import forms
from .models import Company, Team
from registration.models import User


class AdminValidator(forms.Field):

    def validate(self, value):
        try:
            int(value)
        except (TypeError, ValueError):
            raise forms.ValidationError("Enter valid data")
        if not value:
            raise forms.ValidationError("This field is required")
        user = User.get_by_id(value)
        if not user:
            raise forms.ValidationError("This user didn't exists")


class CompanyForm(forms.ModelForm):
    class Meta:
        model = Company
        exclude = ['admin']


class TeamForm(forms.ModelForm):
    class Meta:
        model = Team
        exclude = ['members', 'company', 'admin']
    admin = AdminValidator()
