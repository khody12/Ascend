from django.contrib import admin

# Register your models here.

from .models import User, WeightEntry

admin.site.register(User)
admin.site.register(WeightEntry)