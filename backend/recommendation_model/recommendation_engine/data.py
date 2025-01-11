
# input features: 
#[muscle (inputted by user), how they feeling (inputted by user), sleep score (oura), 
# stress (oura), activity today (oura), workoutname (meta data, not used for training), relevance score ]
import csv
data = []


def data_processing():
    with open("data.csv", newline="") as csvfile:
        csv_reader = csv.reader(csvfile)

        for line in csv_reader:
            data.append(line)


data_processing()
