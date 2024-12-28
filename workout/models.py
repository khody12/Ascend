from django.db import models
from exercise.models import Exercise
from user.models import User
# Create your models here.

class Workout(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exercises = models.ManyToManyField(Exercise)

    def __str__(self):
        return f"{self.name} created by {self.user.username}"
