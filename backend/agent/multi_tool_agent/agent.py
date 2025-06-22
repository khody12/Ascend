import sys
import os
import django

# Add the 'backend' directory to Python's path
# This assumes your script is in ascend/backend/agent/multi_tool_agent/
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(project_root)

# Now set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ascend.settings')
django.setup()



import datetime
from zoneinfo import ZoneInfo
from google.adk.agents import Agent

from google.adk.models.lite_llm import LiteLlm # For multi-model support
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types # For creating message Content/Parts
from google.adk.tools import FunctionTool
import warnings
# Ignore all warnings
warnings.filterwarnings("ignore")

from workout.models import WorkoutExercise, WorkoutSession
from exercise.models import Tag, Exercise, ExerciseRecord
from django.contrib.auth import get_user_model
from django.db.models import Sum

from datetime import timedelta
from django.utils import timezone

from asgiref.sync import sync_to_async


User = get_user_model()

@sync_to_async
def get_workout_volume(user_id: int) -> float:
    """
    Gets the total workout volume (sum of reps * weight for each set) for a user
    over the last 14 days.

    Args:
        user_id (int): The ID of the user whose workout volume is requested.

    Returns:
        float: The total workout volume, or 0.0 if no relevant workout sets or user not found.
    """
    try:
        user = User.objects.get(id=user_id)
        seven_days_ago = timezone.now() - timedelta(days=14)

        recent_workout_exercises = WorkoutExercise.objects.filter(
            workout__user=user,
            workout__date__gte=seven_days_ago.date()
        )

        total_volume = sum(workoutExercise.calculate_volume() for workoutExercise in recent_workout_exercises)
        return float(total_volume)

    except User.DoesNotExist:
        print(f"DEBUG: User with ID {user_id} not found for workout volume.")
        return 0.0
    except Exception as e:
        print(f"ERROR: Failed to get workout volume for user {user_id}: {e}")
        return 0.0
    
@sync_to_async
def get_exercises_by_musclegroup(muscle_group: str) -> dict:
    """
    Gets a list of exercise names for a given muscle group tag (e.g., 'Chest', 'Back').
    Use this tool when the user wants to know what types of exercises exist for a
    specific muscle, not for a personalized recommendation.

    Args:
        muscle_group (str): The name of the muscle group to search for.

    Returns:
        dict: A dictionary containing a list of exercise names or an error message.
    """
    try:
        # We use .iexact for a case-insensitive match on the tag name
        exercises = Exercise.objects.filter(tags__name__iexact=muscle_group)

        if not exercises.exists():
            return {
                "status": "error",
                "error_message": f"Sorry, I couldn't find any exercises for the muscle group '{muscle_group}'. Please check the spelling or try another muscle group."
            }

        exercise_names = sorted([exercise.name for exercise in exercises])
        return {"status": "success", "exercises": exercise_names}

    except Exception as e:
        print(f"ERROR: Failed to get exercises for muscle group {muscle_group}: {e}")
        return {
            "status": "error",
            "error_message": "An unexpected error occurred while looking up exercises."
        }

@sync_to_async
def get_workout_musclegroups(user_id: int) -> dict:
    """
    Returns the distinct muscle group tags (e.g., 'Back', 'Legs', 'Chest')
    associated with exercises performed by the user in their workouts over the last week.
    Use this tool to gather context to understand what muscle groups they have not recently
    been hitting for a balanced recommendation.

    Args:
        user_id (int): The ID of the user whose workout muscle groups targeted is requested.

    Returns:
        dict: A dictionary containing 'status' and 'report' (list of muscle group names)
              or 'error_message' if no relevant workouts or user not found.
    """
    try:
        user = User.objects.get(id=user_id)
        seven_days_ago = timezone.now() - timedelta(days=14)

        # REWORKED QUERY: Using the new, cleaner relationship path.
        # The old 'tags__workoutexercise_set__...' is now 'tags__exercise__...'
        distinct_muscle_group_names = Tag.objects.filter(
            tags__exercise__workout__user=user,
            tags__exercise__workout__date__gte=seven_days_ago.date()
        ).values_list('name', flat=True).distinct()

        if distinct_muscle_group_names:
            report_list = sorted(list(distinct_muscle_group_names))
            return {"status": "success", "report": report_list}
        else:
            return {
                "status": "error",
                "error_message": (
                    f"Sorry, I don't have recent workout muscle group information for you. "
                    "Please log some workouts with exercises that have assigned tags (e.g., 'Back', 'Legs') for a more personalized recommendation!"
                ),
            }

    except User.DoesNotExist:
        print(f"DEBUG: User with ID {user_id} not found for workout muscle groups.")
        return {
            "status": "error",
            "error_message": (
                f"Sorry, I couldn't find your user profile to get workout muscle groups."
            ),
        }
    except Exception as e:
        print(f"ERROR: Failed to get workout muscle groups for user {user_id}: {e}")
        return {
            "status": "error",
            "error_message": (
                f"An unexpected error occurred while retrieving your workout muscle groups. Please try again later."
            ),
        }
    
@sync_to_async
def get_recent_exercises(user_id: int):
    """
    Gets a list of distinct, specific exercise names performed by a user recently.
    Use this tool when a user asks what exercises they have been doing or focusing on.
    Do not use this for broad categories; use get_workout_musclegroups for that.

    Args:
        user_id (int): The ID of the user whose recent exercises are requested.
        days_ago (int): The number of days to look back. Defaults to 30.

    Returns:
        dict: A dictionary containing the status and a list of exercise names.
    """
    try:
        user = User.objects.get(id=user_id)
        time_window = timezone.now() - timedelta(days=14)

        # This query traverses from Exercise -> WorkoutExercise -> WorkoutSession -> User
        # It leverages the related_name='exercise' you set up.
        recent_exercise_names = Exercise.objects.filter(
            exercise__workout__user=user,
            exercise__workout__date__gte=time_window.date()
        ).values_list('name', flat=True).distinct()

        if not recent_exercise_names:
            return {
                "status": "error",
                "error_message": f"I couldn't find any specific exercises logged for you in the last {14} days."
            }

        # Sort the list alphabetically for a clean, predictable output
        report_list = sorted(list(recent_exercise_names))
        return {"status": "success", "exercises": report_list}

    except User.DoesNotExist:
        return {"status": "error", "error_message": "Sorry, I couldn't find your user profile."}
    except Exception as e:
        print(f"Error in get_recent_exercises: {e}")
        return {"status": "error", "error_message": "An unexpected error occurred while retrieving your recent exercises."}



root_agent = Agent(
    name="workout_recommendation_agent",
    model="gemini-2.0-flash",
    description=(
        "An agent that can provide personalized workout recommendations by looking "
        "at user history, or can provide general information about exercises for "
        "different muscle groups."
    ),
    instruction=(
        "You are a helpful and motivating agent who can answer user questions about "
        "workouts. Use the available tools to get information about the user's workout "
        "history or to look up exercises by muscle group. After calling tools and getting "
        "the information, provide a comprehensive and helpful response."
    ),
    tools=[get_workout_volume, get_workout_musclegroups, get_exercises_by_musclegroup, get_recent_exercises],
)