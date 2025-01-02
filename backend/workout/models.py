from django.db import models
from exercise.models import Exercise
from user.models import User
import datetime
# Create your models here.

class Workout(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    
    user = models.ForeignKey(User, related_name='workouts', on_delete=models.CASCADE)
    exercises = models.ManyToManyField(Exercise, related_name='exercises')

    date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} created by {self.user.username}"
