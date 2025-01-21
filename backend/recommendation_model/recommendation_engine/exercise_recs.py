import torch
import pandas as pd
from model import RelevanceModel
from sklearn.preprocessing import LabelEncoder



df = pd.read_csv("test.csv", names=["Muscle Group", "Exercise Name", "Workout Difficulty"])


le = LabelEncoder()
df['Muscle Group Encoded'] = le.fit_transform(df['Muscle Group'])
df["Workout Difficulty"] = pd.to_numeric(df["Workout Difficulty"], errors="coerce")

loaded_model = RelevanceModel()

loaded_model.load_state_dict(torch.load("workout_model.pth"))
loaded_model.eval()

sleep_score = 70
feeling = 4
muscle_group = "Chest"

with torch.inference_mode():
    tensor = torch.tensor([])


def recommend_exercises(muscle_group, sleep_score, feeling, top_n=3):
    muscle_group_encoded = le.transform([muscle_group])[0]

    filtered_exercises = df[df['Muscle Group'] == muscle_group]

    recs = []

    for _, row in filtered_exercises.iterrows():

        difficulty = row['Workout Difficulty']
        feature_vector = torch.tensor([[muscle_group_encoded, sleep_score, feeling, difficulty]], dtype=torch.float32)

        with torch.no_grad():
            relevance_score = loaded_model(feature_vector).item()

        recs.append((row["Exercise Name"], relevance_score))
    
    recs = sorted(recs, key=lambda x: x[1], reverse=True)
    print("recs:", recs)

    return recs[:top_n]
top_recs = recommend_exercises(muscle_group, sleep_score, feeling)

for exercise, score in top_recs:
    print(f"Exercise: {exercise}, Relevance Score: {score}")