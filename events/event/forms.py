from django import forms
from .models import Event
from datetime import datetime
from pytz import utc as TZ

class DateValidator(forms.Field):
    def validate(self, value):
        time_now = datetime.now().timestamp()
        if not value:
            raise forms.ValidationError("This field is required")
        try:
            check_time = float(value)
        except:
            raise forms.ValidationError("Enter valid date")
        if check_time - time_now < 60 * 15: # 60 seconds * 15 minutes
            raise forms.ValidationError("The Date can not be earlier than now")
        super(self.__class__, self).validate(value)
        return value


class EventCreateForm(forms.ModelForm):
    class Meta:
        model = Event
        exclude = ['participants', 'start_date', 'end_date', 'owner']
    start_date = DateValidator()
    end_date = DateValidator()

    def clean_title(self):
        title = self.cleaned_data['title']
        if len(title) > 20:
            raise forms.ValidationError("Cannot be more than 20 characters")
        return title
    
    def clean_description(self):
        description = self.cleaned_data['description']
        if len(description) > 200:
            raise forms.ValidationError("Cannot be more than 200 characters")
        return description

    def clean_location(self):
        location = self.cleaned_data['location']
        try:
            isinstance(location[0], float) and isinstance(location[1], float)
        except:
            raise forms.ValidationError("Enter valid data")
        return location

    def clean_start_date(self):
        return TZ.localize(datetime.utcfromtimestamp(float(self.cleaned_data['start_date']))) 

    def clean_end_date(self):
        end_date = TZ.localize(datetime.utcfromtimestamp(float(self.cleaned_data['end_date']))) 
        if (end_date - self.cleaned_data['start_date']).seconds < 60 * 15: # 60 seconds * 15 minutes
            raise forms.ValidationError("End Date and Time cannot be earlier than Start Date")
        return end_date
