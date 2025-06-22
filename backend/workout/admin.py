from django.contrib import admin

# Register your models here.
from .models import WorkoutSession, WorkoutExercise

admin.site.register(WorkoutSession)
admin.site.register(WorkoutExercise)