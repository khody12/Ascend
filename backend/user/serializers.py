
from user.models import User
from workout.models import Workout, WorkoutSet
from exercise.models import Exercise

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ['id','first_name', 'last_name', 'username', 'email', 'password', 'confirm_password', 'user_weight', 'user_height', 'user_gender']

    def validate(self, data):
        password = data['password']
        if password != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "passwords dont match"})
        if len(password) < 8:
            raise serializers.ValidationError({"password": "Password must be at least 8 characters long."})
        if not any(char.isdigit() for char in password):
            raise serializers.ValidationError({"password": "Password must include at least one numeric character."})
        if not any(char.isalpha() for char in password):
            raise serializers.ValidationError({"password": "Password must include at least one letter."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128, write_only=True)

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'tags']


class WorkoutSetSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkoutSet
        fields = ['id', 'workout', 'exercise', 'reps', 'weight']

class CreateWorkoutSerializer(serializers.ModelSerializer):
    workout_sets = WorkoutSetSerializer(many=True)

    class Meta:
        model = Workout
        fields = ['id', 'name', 'date', 'workout_sets']
    
    def create(self, validated_data): # we need to override create because we are saving the workout at 
        # the very end of the users workout. but we need to do nested writes
        # i.e. we need to write WorkoutSets within the Workout creation. 
        workout_sets_data = validated_data.pop('workout_sets')
        workout = Workout.objects.create(**validated_data) # create main workout instance
        for set_data in workout_sets_data:
            WorkoutSet.objects.create(workout=workout, **set_data)
        return workout

class UserDashboardSerializer(serializers.ModelSerializer):
    workouts = CreateWorkoutSerializer(many=True)
    favorite_exercises = ExerciseSerializer(many=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'workouts', 'favorite_exercises']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'date_joined', 
                  'user_weight', 'user_height', 'user_gender', 'lifetime_weight_lifted']
        

