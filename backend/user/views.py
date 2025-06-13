from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions, authentication
from rest_framework.generics import GenericAPIView
from user.serializers import UserLoginSerializer, UserRegistrationSerializer, UserDashboardSerializer, UserProfileSerializer, CreateWorkoutSerializer, WeightEntrySerializer

from exercise.serializers import ExerciseSerializer, ExerciseRecordSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from .models import User, WeightEntry
from exercise.models import Exercise, ExerciseRecord
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

# Typical journey for these APIViews

#1. Raw request from frontend arrives at django server
#2. Goes through Django Authentication
#3. Lookat headers, gets your token if its there, looks up token table in database and finds the matching token object and then returns the User object that is linked to the token.
#4. now we get self.request.user after user is fetched from the database.. The request is now enriched with the necessary data. 



# token authentication = who are you?
# isAuthenticated is for permissions, can you access this? are you allowed to do X?

# isAuthenticated runs after tokenAuthentication and relies on tokenAUthentication to have done its job. 
# you can have access to a certain view as long as you are authenticated by a token. Thats all it does.

class UserLoginAPIView(GenericAPIView):
    serializer_class = UserLoginSerializer
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data) #creates instance of UserLoginSerializer, populates it with data from requests body, so username & password
        if serializer.is_valid(): # if both fields are there and look good, we proceed. 
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password) # goes into postgres database and checks if we have a match. 
             # print(user)
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

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Validation errors:", serializer.errors)  # Log validation errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(id=response.data['id'])
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "id": user.id,
            "username":user.username,
            "message" : "registration successful!"
        }, status=status.HTTP_201_CREATED)
    # by default, createAPI View will return serialized data of new object, so all the data you needed to actually create a user,
    # is what would be sent back in the response. 
    # But we only need some information sent back, i dont need their email and weight yet for example.
    # But i also need to send with them a token so that the program knows they are authenticated, and that is not part of the object by default
    # thus we need to override.

class UserDashboardAPIView(generics.RetrieveAPIView):
    # standard behavior of RetrieveAPIView if we don't redefine get_object, is that it would use the pk/slug that it expects to find in the URL.
    # in this standard case, we would need to define a queryset, typically queryset = User.objects.all(), but since we override, and we have it in self.request.user
    # we dont need this line.
    # queryset = User.objects.all(), we don't need this here, because we manually defined the get_object. 

    serializer_class = UserDashboardSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated] # only uses who have been authenticated via token authentication have access to this api view

    def get_object(self):
        return self.request.user

class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    # queryset = User.objects.all() again we dont need this line for the same reason as in userdashboard.
    serializer_class = UserProfileSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user # dont need to look up a user, authenticated user is available in self.request.user, so thats what we return.

class CreateWorkoutAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = CreateWorkoutSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

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

class WeightEntryView(generics.ListAPIView):
    serializer_class = WeightEntrySerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WeightEntry.objects.filter(user=self.request.user)
    
class SubmitWeightEntry(generics.CreateAPIView):
    queryset = WeightEntry.objects.all() # have to be able to map it to any user.
    serializer_class = WeightEntrySerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer): # because we need to set the foreign key, we need this perform_create
        serializer.save(user=self.request.user)
        # perform_create is essentially a method to save the object to the database,
        # so at this point, a serializer object has been created,
        # its holding raw data from axios,
        # serializer runs validation rules thoruhg ser.is_valid
        # if it succeeds, it creates a private dictionary serializer.validated_data
        # now at this point its missing user because we don't want the post request to have the user id sent over
        # we also told the serializer user was read only for security purposes.
        # now we just save the object, but we also pass in user=self.request.user, filling in that user field
        







    
    



    
    







