import torch
import random
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import sys

import pandas as pd
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from data_reader import data
from sklearn.model_selection import train_test_split

torch.manual_seed(42)

le_workout = LabelEncoder()
scaler = MinMaxScaler()
training_split = int(len(data) * 0.8)



df = pd.DataFrame(data, columns=["Muscle", "Sleep Score", "Feeling", "Workout Name", "Workout Difficulty", "Relevance Score"])
for col in ["Sleep Score", "Feeling", "Workout Difficulty", "Relevance Score"]:
    df[col] = pd.to_numeric(df[col], errors="coerce")
workout_names = df["Workout Name"].tolist()


#df = df.sample(frac=1) # shuffle our rows so trains equally on all muscle groups.





y = pd.to_numeric(df["Relevance Score"]) # labels being stored as objects so need to convert to integers.
# scale our labels to the 0-1 range
y_min = y.min()
y_max = y.max()
y_normalized = (y - y_min) / (y_max - y_min)

y_tensor = torch.tensor(y_normalized.values, dtype=torch.float32).view(-1, 1)
print(y.isna().sum()) 

df["Muscle"] = le_workout.fit_transform(df["Muscle"])


X = df[["Muscle", "Sleep Score", "Feeling", "Workout Difficulty"]]




print(df.dtypes)
X_scaled = scaler.fit_transform(X) # this basically changes our data from ranging from differences like 0-100, to 0-1. every one of our numbers will be within that range leading to more consistency. matches label ranegs.

X_tensor = torch.tensor(X_scaled, dtype=torch.float32)
print("head:", y.head())
print("type", y.dtype)



# X_train = X_tensor[:training_split]
# X_test = X_tensor[training_split:]

# y_train = y_tensor[:training_split]
# y_test = y_tensor[training_split:]

# train_test split from sklearn shuffles datarows. 
X_train, X_test, y_train, y_test = train_test_split(
    X_tensor, y_tensor, test_size=0.2, random_state=42
)


print(y_tensor.min(), y_tensor.max())

print("NaN in X_train:", torch.isnan(X_train).sum().item())
print("NaN in X_test:", torch.isnan(X_test).sum().item())
print("NaN in y_train:", torch.isnan(y_train).sum().item())
print("NaN in y_test:", torch.isnan(y_test).sum().item())

print("Rows with NaN in X:")
print(df[df.isna().any(axis=1)])

rows_with_sleep_9 = df[df["Sleep Score"] == 9]
print(rows_with_sleep_9)

#grid search
# param_grid = {
#     "learning_rate": [0.01, 0.001],
#     "neurons_per_layer": [4, 8, 16],
#     "num_layers": [2, 3, 4]
# }
#best parameters
param_grid = {
    "learning_rate":[0.001],
    "neurons_per_layer":[16],
    "num_layers":[4]
}

# class RelevanceModel(nn.Module):
#     def __init__(self):
#         super().__init__()
#         self.layer_1 = nn.Linear(in_features=4, out_features=8)
#         self.layer_2 = nn.Linear(in_features=8, out_features=8)
#         self.layer_3 = nn.Linear(in_features=8, out_features=1)
#         self.relu = nn.ReLU()
        
#     def forward(self, x):
#         x = self.relu(self.layer_1(x))
#         x = self.relu(self.layer_2(x))
#         x = self.layer_3(x)
#         return x


# optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

def train_model(params, X_train, y_train, X_test, y_test, epochs=1000):
    # Unpack parameters
    learning_rate = params["learning_rate"]
    neurons_per_layer = params["neurons_per_layer"]
    num_layers = params["num_layers"]

    # Define the model dynamically based on the hyperparameters
    class RelevanceModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.layers = nn.ModuleList()
            self.layers.append(nn.Linear(in_features=4, out_features=neurons_per_layer))
            for _ in range(num_layers - 1):
                self.layers.append(nn.Linear(in_features=neurons_per_layer, out_features=neurons_per_layer))
            self.layers.append(nn.Linear(in_features=neurons_per_layer, out_features=1))
            self.relu = nn.ReLU()
        
        def forward(self, x):
            for layer in self.layers[:-1]:
                x = self.relu(layer(x))
            x = self.layers[-1](x)
            return x

    # Initialize model, loss, and optimizer
    model = RelevanceModel().to("cpu")
    loss_fn = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    
    for epoch in range(epochs):
        model.train()
        y_probs = model(X_train)

        loss = loss_fn(y_probs, y_train)

        optimizer.zero_grad()

        loss.backward()
        optimizer.step()

        model.eval()
        with torch.no_grad():
            y_preds = model(X_test)
            test_loss = loss_fn(y_preds, y_test)
        
        if epoch % 100 == 0:
            with torch.inference_mode():
                    y_preds = model(X_test)
                    test_loss = loss_fn(y_preds, y_test)

                    # print("Predictions:", test_y_probs.squeeze().tolist())  # Print predicted values
                    # print("True Values:", y_test.squeeze().tolist())  
                    y_pred_denormalized = y_preds * (y_max - y_min) + y_min
                    y_test_denormalized = y_test * (y_max - y_min) + y_min
                    test_loss_original = torch.mean((y_pred_denormalized - y_test_denormalized) ** 2)
                

                    if epoch % 100 == 0:
                        print(f"Epoch: {epoch} | Loss: {loss}| Test loss: {test_loss} ")
    torch.save(model.state_dict(), "workout_model.pth")
    return test_loss.item()

   

        
    
from itertools import product

# Generate all combinations of hyperparameters
param_combinations = list(product(*param_grid.values()))
best_params = None
best_loss = float("inf")

# Grid search loop

for param_set in param_combinations:
    params = dict(zip(param_grid.keys(), param_set))
    print(f"Testing parameters: {params}")
    
    test_loss = train_model(params, X_train, y_train, X_test, y_test)
    print(f"Test loss: {test_loss}")

    if test_loss < best_loss:
        best_loss = test_loss
        best_params = params


print(f"Best parameters: {best_params}")
print(f"Best test loss: {best_loss}")



                


