from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    UserWeight = models.DecimalField(default=0, max_digits=4, decimal_places=1, null=True, blank=True)
    UserHeight = models.DecimalField(default=0, max_digits=3, decimal_places=1, null=True, blank=True)
    UserGender = models.CharField(choices=[('male', 'Male'), ('female', 'Female')], null=True, blank=True)
    lifetimeWeightLifted = models.DecimalField(default=0, max_digits=12, decimal_places=1)




