import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json 
import sys

from scipy.stats import norm
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

df = pd.read_csv("cleanData.csv")

# Train the model on the entire dataset
X = df.drop(columns=['price'])  # Features
y = df['price']  # Target variable

# Split the data: 80% for training, 20% for testing
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Creating and training the model (using Linear Regression as an example)
model = LinearRegression()
model.fit(X_train, y_train)

# Evaluate the model with the testing set (optional but recommended)
y_pred = model.predict(X_test)

# from sklearn.metrics import mean_squared_error
# rmse = mean_squared_error(y_test, y_pred, squared=False)


# print(f"Root Mean Squared Error (RMSE): {rmse:.2f}")


def suggest_price(guests, bedrooms, beds, bathrooms):
    # Create a dictionary with the input values
    input_data = {
        'guests': [guests],
        'bedrooms': [bedrooms],
        'beds': [beds],
        'bathrooms': [bathrooms]
    }
    
    # Convert to a DataFrame
    input_df = pd.DataFrame(input_data)
    
    # Make sure to preprocess the input the same way as your training data
    # For example, if you one-hot encoded 'room_type', do the same here
    input_df = pd.get_dummies(input_df)
    
    # Ensure that all columns match the model's training features
    input_df = input_df.reindex(columns=X.columns, fill_value=0)
    
    # Make a prediction
    predicted_price = model.predict(input_df)[0]
    
    return str(predicted_price)

if __name__ == "__main__":
  if len(sys.argv) > 1:
    try:
      # Parse arguments as JSON
      arguments = json.loads(sys.argv[1])
      guests = arguments["guests"]
      bedrooms = arguments["bedrooms"]
      beds = arguments["beds"]
      bathrooms = arguments["bathrooms"]

      predicted_price = suggest_price(guests, bedrooms, beds, bathrooms)
      print(predicted_price)
    except json.JSONDecodeError:
      print("Invalid JSON format")

# predicted_price = suggest_price(guests=5, bedrooms=4, beds=6, bathrooms=4)

# print(f"Suggested Price: ${predicted_price:.2f}")

print("hello World 123")