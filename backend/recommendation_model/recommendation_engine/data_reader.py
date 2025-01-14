
# input features: 
#[muscle (inputted by user), how they feeling (inputted by user), sleep score (oura), 
# stress (oura), activity today (oura), workoutname (meta data, not used for training), relevance score ]
import csv
data = []
chest_data = "Chest_Dataset.csv"
full_data = "data.csv"
leg_data = "leg_data.csv"
lengthened_leg_data = "longer_leg_data.csv"
arm_data = "arm_data.csv"
def data_processing():
    with open(full_data, newline="") as csvfile:
        csv_reader = csv.reader(csvfile)

        for line in csv_reader:
            data.append(line)


data_processing()


# shortened regular leg data gets the lowest test loss for legs on its own with around 0.05
# combined chest and shorter leg data gives us a test loss of around 0.0089
# combined chest and longer leg data gives us test loss of 0.00725. 
# so interestingly that extra helps in the combined version, but hurts when its just leg. 