
from user.models import User
from workout.models import Workout, WorkoutSet
from exercise.models import Exercise, Tag, ExerciseRecord
from django.db.models import F
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.utils import timezone

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class ExerciseSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True)
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'tags']


class ExerciseRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseRecord
        fields = ['id', 'user', 'exercise', 'personal_record', 'lifetime_reps', 'date_of_pr']