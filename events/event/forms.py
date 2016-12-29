from django import forms
from .models import Event
from datetime import datetime
from pytz import utc as TZ

class DateValidator(forms.Field):
    def validate(self, value):
        time_now = datetime.now().timestamp()
        if not value:
            raise forms.ValidationError("This field is required.", code="required")
        try:
            time = float(value)
        except:
            raise forms.ValidationError("Enter valid date.", code="item_invalid")
        if time - time_now < 60 * 15:
            raise forms.ValidationError("The Date can not be earlier than now.", code="early")
        super(self.__class__, self).validate(value)
        return value


class EventCreateForm(forms.ModelForm):
    class Meta:
        model = Event
        exclude = ['participants', 'start_date', 'end_date', 'owner']
    start_date = DateValidator()
    end_date = DateValidator()


    def clean_start_date(self):
        return TZ.localize(datetime.utcfromtimestamp(float(self.cleaned_data['start_date']))) 

    def clean_end_date(self):
        end_date = TZ.localize(datetime.utcfromtimestamp(float(self.cleaned_data['end_date']))) 
        if (end_date - self.cleaned_data['start_date']).seconds > 60 * 15:
            raise forms.ValidationError("End Date and Time cannot be earlier than Start Date", code="early")
        return end_date