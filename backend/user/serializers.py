
from user.models import User
from workout.models import Workout
from exercise.models import Exercise

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ['id','first_name', 'last_name', 'username', 'email', 'password', 'confirm_password', 'UserWeight', 'UserHeight', 'UserGender']

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
        fields = ['id', 'name']

class WorkoutSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True)

    class Meta:
        model = Workout
        fields = ['id', 'name', 'date', 'exercises']

class UserDashboardSerializer(serializers.ModelSerializer):
    workouts = WorkoutSerializer(many=True)
    favorite_exercises = ExerciseSerializer(many=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'workouts', 'favorite_exercises']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'date_joined', 
                  'UserWeight', 'UserHeight', 'UserGender', 'lifetimeWeightLifted']