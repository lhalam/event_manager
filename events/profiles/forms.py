from django import forms
from .models import UserProfile


class ProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        exclude = ['user', 'photo']
    education = forms.CharField(max_length=200)
    job = forms.CharField(max_length=200)
