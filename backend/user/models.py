from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
from exercise.models import Exercise

class User(AbstractUser):
    user_weight = models.DecimalField(default=0, max_digits=4, decimal_places=1, null=True, blank=True)
    user_height = models.DecimalField(default=0, max_digits=3, decimal_places=1, null=True, blank=True)
    user_gender = models.CharField(choices=[('male', 'Male'), ('female', 'Female')], null=True, blank=True)
    lifetime_weight_lifted = models.DecimalField(default=0, max_digits=12, decimal_places=1)
    
    
    favorite_exercises = models.ManyToManyField(Exercise, blank=True)





