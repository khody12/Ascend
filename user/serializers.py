
from user.models import User
from rest_framework import serializers

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    class Meta:
        Model = User
    fields = ['username', 'email', 'password', 'confirm_password', 'UserWeight', 'UserHeight']

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
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)