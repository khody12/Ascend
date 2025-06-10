from django.db import models
from django.conf import settings
# Create your models here.
class Tag(models.Model): # simply things like "strength/cardio/Back/Legs. things like this, categories essentially"
    name = models.CharField(max_length=50) 

    def __str__(self):
        return self.name  

class Exercise(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    tags = models.ManyToManyField(Tag, related_name="tags")

    def __str__(self):
        return self.name
    
class ExerciseRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    personal_record = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    lifetime_reps = models.PositiveIntegerField(default=0)
    date_of_pr = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'exercise')

