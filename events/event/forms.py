from django import forms
from .models import Event
from datetime import datetime

class DateValidator(forms.Field):
    def validate(self, value):
        time_now = datetime.now().timestamp()
        if not value:
            raise forms.ValidationError("This field is required")
        try:
            float(value)
        except:
            raise forms.ValidationError("Enter valid date")
        if float(value) - time_now < 60 * 60:
            raise forms.ValidationError("The Date can not be earlier than now")
        super(self.__class__, self).validate(value)
        return value


class EventCreateForm(forms.ModelForm):
    class Meta:
        model = Event
        exclude = ['participants', 'start_date', 'end_date']
    start_date = DateValidator()
    end_date = DateValidator()

    def clean_location(self):
        data = self.cleaned_data.get('location')
        try:
            isinstance(data[0], float) and isinstance(data[1], float)
        except:
            raise forms.ValidationError("Enter valid data")
        return data
    
    def clean_end_date(self):
        start_date = self.cleaned_data.get('start_date')
        end_date = self.cleaned_data.get('end_date')
        if float(end_date) - float(start_date) < 60 * 15:
            raise forms.ValidationError("End date cannot be earlier than Start date")
