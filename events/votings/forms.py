from django import forms

from .models import Voting

import time


class TypeValidator(forms.Field):
    allowed_types = ['date', 'place', 'custom']

    def validate(self, value):
        if value not in TypeValidator.allowed_types:
            raise forms.ValidationError("Invalid type of event")
        super(TypeValidator, self).validate(value)


class EndDateValidator(forms.Field):
    def validate(self, value):
        time_now = time.time()
        if not value:
            raise forms.ValidationError("This field is required")
        try:
            float(value)
        except:
            raise forms.ValidationError("Enter valid date")
        if float(value) < time_now:
            raise forms.ValidationError("Time of voting ending can't be in past")
        super(EndDateValidator, self).validate(value)


class VotingForm(forms.ModelForm):
    class Meta:
        model = Voting
        exclude = ['type', 'end_date', 'event', 'voters']
    end_date = EndDateValidator()
    type = TypeValidator()
