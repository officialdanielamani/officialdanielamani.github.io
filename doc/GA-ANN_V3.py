# -*- coding: utf-8 -*-
"""
Created on Fri Feb  2 07:20:31 2024
@author: DANIEL AMANI BIN NOORDIN
@website: danielamani.com
@team:  AIMAN MAZIRI BIN AZHAN
        QADRI WAFI BIN AZMI
        MUHAMMAD FIRDAUS BIN ABU BAKAR

Title: Egg Grading System GA_NN
"""

import numpy as np #To read and create data array
import pandas as pd #To read and create data array
import tensorflow as tf #The AI lib
import matplotlib.pyplot as plt #Plotting graph lib
import seaborn as sns #Pairplot
from tensorflow import keras #AI lib import
from sklearn.model_selection import train_test_split #Split data
from sklearn.preprocessing import LabelEncoder, StandardScaler #Encode Y label and normalize data
from tensorflow.keras import optimizers #Import optimizer
import random #random number generator
from sklearn.metrics import classification_report, confusion_matrix #Add clasification report and confuse matx

# Check TensorFlow version
print("TensorFlow version:", tf.__version__)

def logo_info(): #Just a logo
    print("     __________  _   _____")
    print("    / ____/ __ \/ | / /   |")
    print("   / __/ / / / /  |/ / /| |")
    print("  / /___/ /_/ / /|  / ___ |")
    print(" /_____/_____/_/ |_/_/  |_| \n")

logo_info()
print("Welcome to the Egg Grading System")

# Load dataset
print("========== <PREVIEW DATA SET> ==========")
dataset = pd.read_csv('EggClassDanielRandom.csv')
dataset.columns = ["Height(mm)", "Width(mm)", "Weight(g)", "Grade"]
# Show some data to ensure the correct file is selected
print(dataset.head())

# Visualize the data
pairplot = sns.pairplot(dataset, hue="Grade")
pairplot.fig.suptitle("Pairplot of Egg Dataset by Grade", size=12, y=1.02)  # y=1.02 lifts the title a bit above the plots

plt.show()
# Prepare the data
def preprocess_data(dataset):
    # Split dataset into features (X) and target (y)
    X = dataset.iloc[:, :-1].values
    y = dataset.iloc[:, -1].values
    
    # Apply StandardScaler to normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Use LabelEncoder to encode categorical target labels into integers
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)
    original_labels = ['A', 'B', 'C']
    encoder = LabelEncoder()
    encoder.fit(original_labels)
    print("Egg Class order 0->2")
    print(list(encoder.classes_))
    return X_scaled, y_encoded, scaler, encoder

# Apply the preprocessing function to the dataset
X_scaled, y_encoded, scaler, label_encoder = preprocess_data(dataset)

# Split the data into training, validation, and test sets
X_train, X_temp, y_train, y_temp = train_test_split(X_scaled, y_encoded, test_size=0.30, random_state=42 , stratify=y_encoded)
# Now, split the temporary set into actual validation and test sets
X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp)
# This results in 70% training, 15% validation, and 15% test sets.

#Function to build the model
def build_model(input_shape, layer_config, output_neurons):
    model = keras.Sequential()
    model.add(keras.layers.InputLayer(input_shape=(input_shape,)))
    
    # Hidden layer count depend on input array at function call
    for neurons in layer_config:  # layer_config is a list of neuron counts for each layer
        model.add(keras.layers.Dense(neurons, activation='relu'))
    
    # Output layer config
    model.add(keras.layers.Dense(output_neurons, activation='softmax'))
    # Set learning rate to 0.1 (stable)
    adam_optimizer = optimizers.Adam(learning_rate=0.01)
    # Compile the model with the instantiated optimizer
    model.compile(loss="sparse_categorical_crossentropy",
             optimizer=adam_optimizer,
             metrics=["accuracy"])
    return model

#Function to train and evalaute the model
def train_evaluate_and_plot(model, X_train, y_train, X_val, y_val, X_test, y_test, epochs, batch_size, model_name="Model",use_early_stop=True):
    # Enable or disable auto stop train epoch
    early_stopping = keras.callbacks.EarlyStopping(patience=15, restore_best_weights=True)
    # Conditionally set the callbacks based on use_early_stop
    callbacks = [early_stopping] if use_early_stop else None
    # Train the model with the explicitly created validation set
    history = model.fit(X_train, y_train, epochs=epochs, batch_size=batch_size, validation_data=(X_val, y_val), callbacks=callbacks, verbose=1)
    # To get the number of epochs trained
    trained_epochs = len(history.history['loss'])
    # Evaluate the model on the test set
    test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"{model_name} - Test Loss: {test_loss}, Test Accuracy: {test_accuracy}")
    
    # Plot the training and validation loss
    plt.figure(figsize=(12, 5))
    
    # Plot loss
    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title(f'Loss Curves - {model_name}')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend()
    # Show detail parameter
    plt.figtext(0.5, -0.01, f"Test Loss: {test_loss:.4f}, Test Accuracy: {test_accuracy:.4f}, Total Epochs: {trained_epochs}/{epochs}, Batch Size: {batch_size}, AutoStop: {use_early_stop}", ha="center", fontsize=10)
    # Plot accuracy
    plt.subplot(1, 2, 2)
    plt.plot(history.history['accuracy'], label='Training Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title(f'Accuracy Curves - {model_name}')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.tight_layout()
    plt.show()
    
    # Predict the classes using the test set
    y_pred = model.predict(X_test, batch_size=batch_size)
    # If output layer uses softmax, might need to use np.argmax to get the class labels
    y_pred_classes = np.argmax(y_pred, axis=1)
     # Ensure y_test is not sparse
    if len(y_test.shape) == 2 and y_test.shape[1] > 1:
        y_true_classes = np.argmax(y_test, axis=1)
    else:
        y_true_classes = y_test
  
    # Generate the classification report
    class_report = classification_report(y_true_classes, y_pred_classes)
    print("Classification Report:")
    print(class_report)

    # Generate the confusion matrix
    conf_matrix = confusion_matrix(y_true_classes, y_pred_classes)

    # Plot the confusion matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues')
    plt.title(f'Confusion Matrix - {model_name}')
    plt.xlabel('Predicted Labels')
    plt.ylabel('True Labels')

    # Display the classification report below the confusion matrix plot
    report_text = f"Classification Report:\n{class_report}"
    plt.figtext(0.5, -0.1, report_text, ha="center", fontsize=14, va="top")

    # Adjust the layout to make room for the classification report
    plt.tight_layout()
    plt.show()

    return history

logo_info()
print("========== <TRAINING NN-MODEL> ==========")
# Model NN Configuration
layer_config_model_NN = [90, 30]  # Example: 2 hidden layers with 90 and 30 neurons
nn_model = build_model(input_shape=X_train.shape[1], 
                       layer_config=layer_config_model_NN, 
                       output_neurons=len(np.unique(y_train)))
train_evaluate_and_plot(nn_model, X_train, y_train, X_val, y_val, X_test, y_test,
                        epochs=150,  # Adjust the number of epochs as needed
                        batch_size=24,  # Adjust the batch size as needed
                        model_name="Base_NN", #Give model a name
                        use_early_stop=False) #Disable auto stop

logo_info()
print("========== <TESTING GA-MODEL ACHITECTURE GENERATION> ==========")
print("Note: Please wait, this may take while to process")

#Functions of GA
def selection(population, fitness_scores):
    # Using basic logic
    selected_indices = np.random.choice(range(len(population)), size=2, replace=False, p=fitness_scores/np.sum(fitness_scores))
    return [population[i] for i in selected_indices]

def crossover(parent1, parent2):
    # Fixed to handle chromosomes of length 2
    crossover_point = 1  # Fixed crossover point for a chromosome of length 2
    child1 = parent1[:crossover_point] + parent2[crossover_point:]
    child2 = parent2[:crossover_point] + parent1[crossover_point:]
    return child1, child2

def mutate(chromosome, mutation_rate=0.1):
    for i in range(len(chromosome)):
        if random.random() < mutation_rate:
            chromosome[i] = random.randint(10, 100)  # Ensure this range is appropriate
    return chromosome

#This function to test the model if it fit better
def fitness_function(chromosome):
    # Assuming chromosome is a list like [64, 32], where each element represents (this value just representation, after train will change)
    # the number of neurons in the respective layer of the neural network.
    
    input_shape = X_train.shape[1]  # Make sure X_train is accessible in this scope
    output_neurons = len(np.unique(y_train))  # Ensure y_train is accessible and used to determine the number of output neurons
    
    # Build the model using the updated build_model function
    model = build_model(input_shape=input_shape, 
                        layer_config=chromosome,  # Pass the chromosome as the layer configuration
                        output_neurons=output_neurons)
    
    # Compile and train the model
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(X_train, y_train, epochs=10, batch_size=24, verbose=0)  #Epoch 10 is ok as too many will take long to compute
    
    # Evaluate the model on the validation set
    _, accuracy = model.evaluate(X_val, y_val, verbose=0)  # Make sure X_val and y_val are accessible

    return accuracy

def genetic_algorithm(generations=10, population_size=10):
    population = [[random.randint(10, 100) for _ in range(2)] for _ in range(population_size)]
    best_fitnesses = []  # List to track the best fitness per generation
    average_fitnesses = []  # List to track the average fitness per generation
    
    # Initialization of the best performing chromosome and its corresponding fitness score.
    best_chromosome = None  # This will hold the chromosome with the highest fitness score across all generations.
    best_fitness_global = -np.inf  # Sets a baseline fitness score that any chromosome's fitness will surpass.

    # Start the GA process, iterating over each generation.
    for generation in range(generations):
        # Evaluate the fitness of each chromosome in the current population.
        fitness_scores = np.array([fitness_function(chromosome) for chromosome in population])
    
        # Determine the highest fitness score in this generation's population.
        best_fitness = np.max(fitness_scores)
        # Calculate the average fitness score of this generation's population for analysis.
        average_fitness = np.mean(fitness_scores)
    
        # Keep track of the best and average fitness scores over generations.
        best_fitnesses.append(best_fitness)
        average_fitnesses.append(average_fitness)
    
        # Check if the current generation has yielded a better chromosome than seen globally.
        if best_fitness > best_fitness_global:
            # If so, update the global best fitness and the best chromosome.
            best_fitness_global = best_fitness
            best_chromosome = population[np.argmax(fitness_scores)]
    
        # Prepare the new population for the next generation.
        new_population = []
        for _ in range(population_size // 2):  # For each pair of parents,
            # Perform selection to choose parent chromosomes based on fitness.
            parent1, parent2 = selection(population, fitness_scores)
            # Generate offspring through crossover of the parent chromosomes.
            child1, child2 = crossover(parent1, parent2)
            # Apply mutation to the offspring to maintain genetic diversity.
            new_population.append(mutate(child1))
            new_population.append(mutate(child2))
        # The current population is replaced by the new one for the next generation.
        population = new_population
    
        # Output the progress of the GA after each generation.
        print(f"Generation {generation + 1}: Best fitness = {best_fitness}, Average fitness = {average_fitness}")

    # Plotting the metrics
    plt.figure(figsize=(10, 5))
    plt.plot(best_fitnesses, label='Best Fitness')
    plt.plot(average_fitnesses, label='Average Fitness')
    plt.title('Fitness over Generations')
    plt.xlabel('Generation')
    plt.ylabel('Fitness')
    plt.legend()
    plt.show()

    # Ensure best_chromosome has been assigned a value
    if best_chromosome is not None:
        print(f"Best architecture: {best_chromosome}, Best Fitness: {best_fitness_global}")
        return best_chromosome
    else:
        # Handle the case where best_chromosome remains None
        print("No best chromosome found.")
        return None
    
best_architecture = genetic_algorithm()
logo_info()
print("========== <GA-MODEL BEST ACHITECTURE> ==========") 
print("Best architecture:", best_architecture)

logo_info()
print("========== <TRAINING GA-NN USING BEST ACHITECTURE> ==========")    
ga_nn_model = build_model(input_shape=X_train.shape[1], 
                          layer_config=best_architecture,  # Directly use best_architecture as layer_config
                          output_neurons=len(np.unique(y_encoded)))

# Now, instead of separate training and evaluation steps, use the unified function
# This function will train the model, evaluate it on the test set, and plot the training/validation metrics
train_evaluate_and_plot(ga_nn_model, X_train, y_train, X_val, y_val, X_test, y_test,
                        epochs=150,  # Adjust the number of epochs as needed
                        batch_size=24,  # Adjust the batch size as needed
                        model_name="GA_NN",
                        use_early_stop=True)

def model_info(model, model_name, X_test, y_test):
    print(f"Model Information for {model_name}:")
    model.summary()  # Prints the architecture of the model
    
    # Evaluate the model on the test set
    results = model.evaluate(X_test, y_test, verbose=0)
    
    # Assuming the model was compiled with additional metrics, results will contain more values.
    # results[0] is always loss, results[1] is accuracy, and any subsequent numbers are additional metrics.
    print(f"Test Loss for {model_name}: {results[0]:.4f}")
    print(f"Test Accuracy for {model_name}: {results[1]:.4%}")
    
    # If there are additional metrics, print them out.
    if len(results) > 2:
        metrics = ["Precision", "Recall"]  # Example: Adjust based on the actual metrics depent on test
        for i, metric in enumerate(metrics, start=2):
            print(f"{metric} for {model_name}: {results[i]:.4%}")
    print("\n") 
    
    
# Function to inverse transform features and labels for printing
def print_sample_data(X, y, scaler, label_encoder, set_name="Validation", sample_size=5):
    X_inv_transformed = scaler.inverse_transform(X)
    y_inv_transformed = label_encoder.inverse_transform(y)
    
    print(f"\nSample data from the {set_name} Set:")
    for i in range(sample_size):
        print(f"Sample {i+1}: Height(mm)={X_inv_transformed[i, 0]:.2f}, "
              f"Width(mm)={X_inv_transformed[i, 1]:.2f}, "
              f"Weight(g)={X_inv_transformed[i, 2]:.2f}, Grade={y_inv_transformed[i]}")

# Function to predict the grade based on user input
def predict_grade(nn_model, ga_nn_model, scaler, label_encoder):
    while True:  # Start an infinite loop to continuously prompt the user
        try:
            # Prompt for user input
            print("")
            print("========== <INPUT OWN DATA TO TEST> ==========")
            height = float(input("Enter height (mm): "))
            width = float(input("Enter width (mm): "))
            weight = float(input("Enter weight (g): "))
            print("")
            
            # Create a numpy array from the input and scale it
            input_features = np.array([[height, width, weight]])
            input_features_scaled = scaler.transform(input_features)
            
            # Predict the grade with NN model
            nn_prediction = nn_model.predict(input_features_scaled)
            nn_predicted_grade_index = np.argmax(nn_prediction, axis=1)
            nn_predicted_grade = label_encoder.inverse_transform(nn_predicted_grade_index)
            
            # Predict the grade with GA-NN model
            ga_ann_prediction = ga_nn_model.predict(input_features_scaled)
            ga_ann_predicted_grade_index = np.argmax(ga_ann_prediction, axis=1)
            ga_ann_predicted_grade = label_encoder.inverse_transform(ga_ann_predicted_grade_index)
            
            #Show predicted output
            print(f"Predicted Egg Grade (NN): {nn_predicted_grade[0]}")
            print(f"Predicted Egg Grade (GA-NN): {ga_ann_predicted_grade[0]}")
            
            # Ask the user if they want to continue
            continue_predicting = input("Do you want to predict another grade? (yes/no): ").lower()
            if continue_predicting != 'yes':
                break  # Exit the loop if the user does not want to continue
        except ValueError:
            print("Please enter valid numerical values.")
        except Exception as e:
            print(f"An error occurred: {e}")
        
logo_info()    
print("========== <MODEL PARAMETER> ==========")
#Display model parameter
model_info(nn_model, "NN", X_test, y_test)
model_info(ga_nn_model, "GA_NN", X_test, y_test)
# Print sample data from the validation and test sets
logo_info() 
print("========== <EXAMPLE DATA> ==========")
print_sample_data(X_val, y_val, scaler, label_encoder, "Validation", 5)
print_sample_data(X_test, y_test, scaler, label_encoder, "Test", 5)
# Call the function to predict the grade based on user input, with option to repeat
predict_grade(nn_model, ga_nn_model, scaler, label_encoder)