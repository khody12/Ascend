from django.shortcuts import render
from rest_framework import generics
from user.serializers import ExerciseSerializer
from exercise.serializers import ExerciseSerializer, ExerciseRecordSerializer
from exercise.models import Exercise, ExerciseRecord
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

class ExerciseListAPIView(generics.ListAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

class ExerciseAPIView(generics.RetrieveAPIView):
    
    serializer_class = ExerciseRecordSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExerciseRecord.objects.filter(user=self.request.user)
    def get_object(self):
        queryset = self.get_queryset()
        exercise_pk = self.kwargs['exercise_pk'] # exercise_pk matches whats in the urls.

        try:
            # Look for the specific record linked to the exercise_pk
            obj = queryset.get(exercise__pk=exercise_pk)
            return obj
        except ExerciseRecord.DoesNotExist:
            # We explicitly raise the exception so DRF can handle it.
            raise