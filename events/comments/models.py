from django.db import models
from registration.models import User
from event.models import Event

# Create your models here.


class Comment (models.Model):
    author= models.ForeignKey(User, null=False)
    event = models.ForeignKey(Event, null=True)
    parrent_comment = models.ForeignKey('self', null=True, on_delete=models.CASCADE, related_name='children')
    date_add = models.DateTimeField(auto_now_add=True)
    text = models.TextField(null=False)


    def __str__(self):
        return self.text

    def get_by_id(comment_id):
        try:
            return Comment.objects.get(pk=comment_id)
        except Comment.DoesNotExist:
            return None

    def to_dict(self):
        children = [child.to_dict() for child in self.children.all()]
        author = {
            "id": self.author.id,
            "name": "{} {}".format(self.author.first_name, self.author.last_name)
        }
        return {
            "id": self.id,
            "children": children,
            "text": self.text,
            "author": author,
            "date": self.date_add.timestamp()
        }
