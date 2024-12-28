from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    lifetimeWeightLifted = models.DecimalField(default=0, max_digits=12, decimal_places=1)




