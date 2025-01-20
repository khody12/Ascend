import torch

from backend.recommendation_model.recommendation_engine.model import RelevanceModel

loaded_model = RelevanceModel()
loaded_model.load_state_dict("workout_model.pth")

