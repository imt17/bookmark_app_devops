from django.conf import settings
from django.db import models

class Bookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # Add this line
    url = models.URLField()
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default="Uncategorized")
    is_favorite = models.BooleanField(default=False)

    def __str__(self):
        return self.title
