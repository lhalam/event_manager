from django import forms
from .models import Event

class EventCreateForm(forms.ModelForm):
    title = forms.CharField(max_length = 200, required = True)
    start_date = forms.DateTimeField(required = False)
    end_date = forms.DateTimeField(required = False)
    location = forms.CharField(max_length = 200, required = False)
    description = forms.CharField(required = False)
    address = forms.CharField(max_length=500, required = False)

    class Meta:
        model = Event
        exclude = ['participants', 'owner_id']
