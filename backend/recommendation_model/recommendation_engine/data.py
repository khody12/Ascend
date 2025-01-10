
# input features: 
#[muscle (inputted by user), how they feeling (inputted by user), sleep score (oura), 
# stress (oura), activity today (oura), workoutname (meta data, not used for training), relevance score ]
import csv
data = [
    ["Chest", 9, 82, 32, "Bench Press", 100],
    ["Chest", 9, 82, 40, "Push-Up", 80],
    ["Chest", 9, 82, 50, "Lat Pull Down", 20],
    ["Chest", 9, 82, 40, "Leg Press", 10],
]


def data_processing():
    with open("Chest_Dataset.csv", newline="") as csvfile:
        csv_reader = csv.reader(csvfile)

        for line in csv_reader:
            data.append(line)


data_processing()
