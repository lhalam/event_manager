from django.db import models

# Create your models here.

class Event(models.Model):
    title = models.CharField(max_length = 200)
    start_date = models.DateTimeField(blank = True, null = True)
    end_date = models.DateTimeField(blank = True, null = True)
    location = models.CharField(max_length = 200, null = True)
    description = models.TextField(blank = True, null = True)

    def __str__(self):
        return "%s" % self.title

    #def save(self, *args, **kwargs):	
        #super(Event, self).save(*args, **kwargs)

