import re

from django import forms
from .models import User

PASSWORD_REGEX = re.compile(r'^[A-Za-z0-9]{8,20}$')


class RegistrationForm(forms.Form):
    first_name = forms.CharField(max_length=30)
    last_name = forms.CharField(max_length=30)
    email = forms.EmailField()
    password = forms.CharField(min_length=8, max_length=20)
    birth_date = forms.DateField()

    def clean_password(self):
        password = self.cleaned_data.get('password')
        if not PASSWORD_REGEX.match(password):
            raise forms.ValidationError('Password is not valid. Allowed characters: A-Z a-z 0-9.', code='invalid')

        return password

    def clean_email(self):
        email = self.cleaned_data.get('email')
        try:
            User.objects.get(username=email)
        except User.DoesNotExist:
            return email

        raise forms.ValidationError('User with this email already exists.', code='unique')
