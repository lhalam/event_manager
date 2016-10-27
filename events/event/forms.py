from django import forms
from .models import Event

class EventValidationForm(forms.Form):
    """
    Validation form for Event
    """

    title = forms.CharField(max_length = 200, required = True)
    start_date = forms.DateTimeField(required = False)
    end_date = forms.DateTimeField(required = False)
    location = forms.CharField(max_length = 200, required = False)
    description = forms.CharField(required = False)
