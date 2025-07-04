
from user.models import User, WeightEntry
from workout.models import WorkoutSession, WorkoutExercise
from exercise.models import Exercise, Tag, ExerciseRecord
from django.db.models import F
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.utils import timezone
from exercise.serializers import ExerciseSerializer


# for get requests, the view queries a certain object from the database, and the serializer will turn that model into a dictionary, which DRF turns into JSON

# for post requests, Front end will send JSON to the API, DRF will parse it into a python dict, and the serializer basically takes it and validates it. 
# it checks that the json meets the necessary fields to build that object

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

# class TagSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Tag
#         fields = ['id', 'name']

# class ExerciseSerializer(serializers.ModelSerializer):
#     tags = TagSerializer(many=True)
#     class Meta:
#         model = Exercise
#         fields = ['id', 'name', 'tags']


class WorkoutSetSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer()

    class Meta:
        model = WorkoutExercise
        fields = ['id','exercise', 'reps', 'weight']


class WorkoutReadSerializer(serializers.ModelSerializer):
    workout_sets = WorkoutSetSerializer(many=True)

    class Meta:
        model = WorkoutSession
        fields = ['id', 'name', 'date', 'workout_sets', 'elapsed_time', 'comment']


class CreateWorkoutSerializer(serializers.ModelSerializer):
    workout_sets = WorkoutSetSerializer(many=True, required=False)

    class Meta:
        model = WorkoutSession
        fields = ['id', 'name', 'date', 'workout_sets', 'elapsed_time', 'comment']
    
    def create(self, validated_data): # we need to override create because we are saving the workout at 
        # the very end of the users workout. but we need to do nested writes
        # i.e. we need to write WorkoutSets within the Workout creation. 
        workout_sets_data = validated_data.pop('workout_sets')
        print("Workout Sets Data:", workout_sets_data)

        user = self.context['request'].user # because were in serializers, we dont have access to request,
        # but views will send over context, and we can access it there.
        workout = WorkoutSession.objects.create(user=user, **validated_data) # create main workout instance
        print("Workout Created:", workout)
        for set_data in workout_sets_data:
            print("setdata:", set_data)

            exercise_data = set_data.pop('exercise')
            tags_data = exercise_data.pop('tags', [])
            print("Exercise Data:", exercise_data, "Tags Data:", tags_data)

            exercise, created = Exercise.objects.get_or_create(**exercise_data)
            # the ** basically unpacks the dictionary, within we might have like 'name': 'bench press', and it just unpacks this.
            # exercise will hold the object we found or created, while created is a boolean, True if we created a new object.

            print(f"Exercise {'Created' if created else 'Retrieved'}:", exercise)
            
            for tag_data in tags_data:
                print("tag data:", tag_data)
                tag, created = Tag.objects.get_or_create(**tag_data)
                print(f"Tag {'Created' if created else 'Retrieved'}:", tag)
                exercise.tags.add(tag)
            WorkoutExercise.objects.create(workout=workout,
                                      exercise=exercise,
                                      reps=set_data['reps'],
                                      weight=set_data['weight'],
                                      )
            
            record, created = ExerciseRecord.objects.get_or_create(
                user=user,
                exercise=exercise
            )

            # Update the lifetime reps safely to avoid race conditions
            record.lifetime_reps = F('lifetime_reps') + set_data['reps']
            
            # Check for a new personal record
            if set_data['weight'] > record.personal_record:
                record.personal_record = set_data['weight']
                record.date_of_pr = timezone.now().date()
            
            # Save the updated record
            record.save()
            
        print("validated Data for workout,", validated_data)
        

        return workout



class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'date_joined', 
                  'user_weight', 'user_height', 'user_gender', 'lifetime_weight_lifted']
class basicUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name']

class WeightEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightEntry
        fields = ['id', 'date_recorded', 'weight', 'user']
        read_only_fields = ['id', 'date_recorded', 'user'] # both user and date_recorded not sent over the POST request
        # date_recorded has a default within the model, so it will just be automatically set to that default when the object is created.

class UserDashboardSerializer(serializers.ModelSerializer):
    # these 3 things right here, workout, 
    workouts = WorkoutReadSerializer(many=True) # not in the user model, so we need to add this here.
    favorite_exercises = ExerciseSerializer(many=True) # by default we would just get the keys to the exercise objects, so we would like to do a nested serialization.
    weight_entries = WeightEntrySerializer(many=True) # also not in user model. 
    
    class Meta:
        model = User
        fields = ['id', 'username', 'workouts', 'favorite_exercises', 'weight_entries']

        

