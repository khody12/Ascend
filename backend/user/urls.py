from django.urls import path

from . import views

urlpatterns = [
    path('login/', views.UserLoginAPIView.as_view()),
    path('register/', views.UserCreationAPIView.as_view()),
    path('user/profile/<int:userId>/', views.UserProfileAPIView.as_view()),
    path('api/user/<int:userId>/', views.UserDashboardAPIView.as_view()),
    path('user/create-workout/', views.CreateWorkoutAPIView.as_view())
]