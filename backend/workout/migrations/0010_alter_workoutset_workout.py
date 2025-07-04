# Generated by Django 4.2.14 on 2025-01-08 23:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('workout', '0009_remove_workoutset_unique_workout_exercise'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workoutset',
            name='workout',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workout_sets', to='workout.workout'),
        ),
    ]
