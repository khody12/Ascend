from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
# Create your models here.
from exercise.models import Exercise
from datetime import date
class User(AbstractUser):
    user_weight = models.DecimalField(default=0, max_digits=4, decimal_places=1, null=True, blank=True)
    user_height = models.DecimalField(default=0, max_digits=3, decimal_places=1, null=True, blank=True)
    user_gender = models.CharField(choices=[('male', 'Male'), ('female', 'Female')], null=True, blank=True)
    lifetime_weight_lifted = models.DecimalField(default=0, max_digits=12, decimal_places=1)
    
    
    favorite_exercises = models.ManyToManyField(Exercise, blank=True)

class WeightEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="weight_entries")
    weight = models.DecimalField(max_digits=4, decimal_places=1)

    date_recorded = models.DateField(default=date.today) # this is the default automatic value.
    # POST request will not be sending over the date, because it will just set itself to the current date. 

    class Meta:
        ordering = ['-date_recorded']

    def __str__(self):
        return f"{self.user.username} - {self.weight} lbs on {self.date_recorded.strftime('%Y-%m-%d')}"





