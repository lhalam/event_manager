from django import forms
from .models import UserProfile


class ProfileForm(forms.ModelForm):
    photo = forms.ImageField()
    education = forms.CharField(max_length=200)
    job = forms.CharField(max_length = 200)
