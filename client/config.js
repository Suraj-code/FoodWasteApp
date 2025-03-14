const BASE_URL = "http://10.0.2.2:5000";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getFoodItems = async () => {
    try {
        // Retrieve the stored JWT token
        const token = await AsyncStorage.getItem("token"); // or wherever your token is stored

        if (!token) {
            throw new Error("User is not authenticated. Please log in.");
        }

        const response = await fetch(`${BASE_URL}/get_food`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Pass the token in the header
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching food items:", error);
    }
};

  export const addUser = async (user) => {
    try {
        const response = await fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: {"Content-Tupe": "application/json" },
            body: JSON.stringify(user),
        });
        return response.json();
    } catch (error) {
        console.error("Error adding user:", error)
    }
  }

  export const getUsers = async () => {
    try{
        const response = await fetch(`${BASE_URL}/get_user`);
        const data = await response.json();
        return data;
    }catch (error) {
        console.error("Error fetching user:", error);
    }
  }

  export const getCategoryNames = async () => {
    try {
      const response = await fetch(`${BASE_URL}/get_category`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching categories:",error)
    }
  }
  
  export const addFoodItem = async (foodItem) => {
    try {
      const response = await fetch(`${BASE_URL}/food_items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(foodItem),
      });
      return response.json();
    } catch (error) {
      console.error("Error adding food item:", error);
    }
  };