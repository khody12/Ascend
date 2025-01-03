from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions, authentication
from rest_framework.generics import GenericAPIView
from user.serializers import UserLoginSerializer, UserRegistrationSerializer, UserDashboardSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from .models import User
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


class UserLoginAPIView(GenericAPIView):
    serializer_class = UserLoginSerializer
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            print(user)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({"token": token.key, "id":user.id, "username": username, "message": "Login successful!"}, status=status.HTTP_200_OK) 
                # we return the token authenticating the session and the user id, this user id will allow us to 
                #search up the users information in this session when its necessary.
            return Response({"error": "invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserCreationAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    authentication_classes = [authentication.SessionAuthentication, TokenAuthentication]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(id=response.data['id'])
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "id": user.id,
            "username":user.username,
            "message" : "registration successful!"
        }, status=status.HTTP_201_CREATED)
    # by default, createAPI View will return serialized data of new object and 

class UserDashboardAPIView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserDashboardSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    






