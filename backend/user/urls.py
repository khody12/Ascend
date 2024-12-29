from django.urls import path

from . import views

urlpatterns = [
    path('login/', views.UserLoginAPIView.as_view()),
    path('register/', views.UserCreationAPIView.as_view())
]