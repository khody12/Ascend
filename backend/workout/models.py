from django.db import models
from exercise.models import Exercise
from user.models import User
import datetime
from django.utils import timezone
# Create your models here.

# workouts belong to only one user. it gets created then tied to that user. instead of that being a fundamental part of the user class.

class WorkoutSession(models.Model):
    name = models.CharField(max_length=100)
    comment = models.TextField(blank=True, null=True) # user can comment how they felt, yada yada
    user = models.ForeignKey(User, related_name='workouts', on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now, null=True, blank=True)
    elapsed_time = models.TimeField(default="00:00:00")

    def __str__(self):
        return f"{self.name} created by {self.user.username}"
    
class WorkoutExercise(models.Model):
    workout = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name='workout_sets')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='exercise')
    reps = models.PositiveIntegerField()
    weight  = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    def calculate_volume(self):
        if self.reps and self.weight:
            return self.reps * self.weight
        else:
            return 0
    