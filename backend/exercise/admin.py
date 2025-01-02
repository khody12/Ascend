from django.contrib import admin

# Register your models here.

from .models import Exercise, Tag

admin.site.register(Exercise)
admin.site.register(Tag)