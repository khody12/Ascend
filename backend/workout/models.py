from django.db import models
from exercise.models import Exercise
from user.models import User
import datetime
from django.utils import timezone
# Create your models here.

class Workout(models.Model):
    name = models.CharField(max_length=100)
    comment = models.TextField(blank=True, null=True) # user can comment how they felt, yada yada
    user = models.ForeignKey(User, related_name='workouts', on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now, null=True, blank=True)

    def __str__(self):
        return f"{self.name} created by {self.user.username}"
    
class WorkoutSet(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    reps = models.PositiveIntegerField()
    weight  = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    rest_time = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['workout', 'exercise'], name='unique_workout_exercise')
        ]


