from django.urls import path

from . import views

urlpatterns = [
    path('api/exercises/', views.ExerciseListAPIView.as_view()),
    path('api/exerciseStats/<int:exercise_pk>', views.ExerciseAPIView.as_view()),
]