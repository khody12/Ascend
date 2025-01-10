import torch
import random
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import sys

import pandas as pd
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from data import data

le_workout = LabelEncoder()
scaler = MinMaxScaler()
training_split = int(len(data) * 0.8)
print("data:", data)
df = pd.DataFrame(data, columns=["Muscle", "Sleep Score", "Activity Score", "Feeling", "Workout Name", "Relevance Score"])



y = pd.to_numeric(df["Relevance Score"]) # labels being stored as objects so need to convert to integers.
# scale our labels to the 0-1 range
y_min = y.min()
y_max = y.max()
y_normalized = (y - y_min) / (y_max - y_min)

y_tensor = torch.tensor(y_normalized.values, dtype=torch.float32).view(-1, 1)


df["Muscle"] = le_workout.fit_transform(df["Muscle"])
X = df[["Muscle", "Sleep Score", "Activity Score", "Feeling"]]

X_scaled = scaler.fit_transform(X) # this basically changes our data from ranging from differences like 0-100, to 0-1. every one of our numbers will be within that range leading to more consistency. matches label ranegs.

X_tensor = torch.tensor(X_scaled, dtype=torch.float32)
print("head:", y.head())
print("type", y.dtype)



X_train = X_tensor[:training_split]
X_test = X_tensor[training_split:]

y_train = y_tensor[:training_split]
y_test = y_tensor[training_split:]

print(y_tensor.min(), y_tensor.max())




class RelevanceModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer_1 = nn.Linear(in_features=4, out_features=6)
        self.layer_2 = nn.Linear(in_features=6, out_features=4)
        self.layer_3 = nn.Linear(in_features=4, out_features=1)
        self.relu = nn.ReLU()
        
    def forward(self, x):
        x = self.relu(self.layer_1(x))
        x = self.relu(self.layer_2(x))
        x = self.layer_3(x)
        return x

device = "cpu"
model_0 = RelevanceModel().to(device)

loss_fn = nn.MSELoss()
optimizer = torch.optim.Adam(model_0.parameters(), lr=0.01, weight_decay=1e-4)

epochs = 1000
for epoch in range(epochs):
    model_0.train()
    y_probs = model_0(X_train)

    loss = loss_fn(y_probs, y_train)

    optimizer.zero_grad()

    loss.backward()
    optimizer.step()

    model_0.eval()
    if epoch % 100 == 0:
        with torch.inference_mode():
                y_preds = model_0(X_test)
                test_loss = loss_fn(y_preds, y_test)

                # print("Predictions:", test_y_probs.squeeze().tolist())  # Print predicted values
                # print("True Values:", y_test.squeeze().tolist())  
                y_pred_denormalized = y_preds * (y_max - y_min) + y_min
                y_test_denormalized = y_test * (y_max - y_min) + y_min
                test_loss_original = torch.mean((y_pred_denormalized - y_test_denormalized) ** 2)
            

                if epoch % 100 == 0:
                    print(f"Epoch: {epoch} | Loss: {loss}| Test loss: {test_loss_original.item()} ")
                


