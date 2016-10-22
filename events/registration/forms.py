import re

from django import forms
from validate_email import validate_email
from .models import User

PASSWORD_REGEX = re.compile(r'^[A-Za-z0-9]{6,20}$')


class RegistrationForm(forms.ModelForm):
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)
    email = forms.EmailField(required=True)
    password = forms.CharField(widget=forms.PasswordInput, min_length=6, max_length=20, required=True)
    verify_password = forms.CharField(label='Password again',
                                      widget=forms.PasswordInput,
                                      min_length=6,
                                      max_length=20,
                                      required=True
                                    )
    birth_date = forms.DateField(widget=forms.DateInput, required=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'verify_password', 'birth_date']

    def clean_verify_password(self):
        pass1 = self.cleaned_data.get('password')
        pass2 = self.cleaned_data.get('verify_password')

        if not PASSWORD_REGEX.match(pass1):
            raise forms.ValidationError('Password is not valid.')
        if not pass2 or pass1 != pass2:
            raise forms.ValidationError('Passwords are not equal.')

        return pass2

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not validate_email(email):
            raise forms.ValidationError('Email is not valid.')
        try:
            User.objects.get(username=email)
        except User.DoesNotExist:
            return email

        raise forms.ValidationError('User with this email already exists.')