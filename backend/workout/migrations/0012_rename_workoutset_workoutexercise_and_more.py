# Generated by Django 5.2.1 on 2025-06-21 05:34

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('exercise', '0006_exerciserecord'),
        ('workout', '0011_remove_workoutset_rest_time'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameModel(
            old_name='WorkoutSet',
            new_name='WorkoutExercise',
        ),
        migrations.RenameModel(
            old_name='Workout',
            new_name='WorkoutSession',
        ),
    ]
