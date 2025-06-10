from django.db import models

# Create your models here.
class Tag(models.Model): # simply things like "strength/cardio/Back/Legs. things like this, categories essentially"
    name = models.CharField(max_length=50) 

    def __str__(self):
        return self.name  

class Exercise(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    tags = models.ManyToManyField(Tag, related_name="tags")

    def __str__(self):
        return self.name

