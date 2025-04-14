const BASE_URL = "http://10.0.2.2:5000";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getFoodItems = async () => {
    try {
        // Retrieve the stored JWT token
        const token = await AsyncStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${BASE_URL}/get_food`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            // Token is invalid or expired
            await AsyncStorage.removeItem('token');
            throw new Error("Authentication failed. Please log in again.");
        }

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching food items:", error);
        throw error;
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
        const token = await AsyncStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${BASE_URL}/get_category`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            await AsyncStorage.removeItem('token');
            throw new Error("Authentication failed. Please log in again.");
        }

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};

export const addFoodItem = async (foodItem) => {
    try {
        const token = await AsyncStorage.getItem("token"); // or wherever your token is stored

        if (!token) {
            throw new Error("User is not authenticated. Please log in.");
        }
        const response = await fetch(`${BASE_URL}/food_items`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(foodItem),
        });
        return response.json();
    } catch (error) {
        console.error("Error adding food item:", error);
    }
};

export const deleteFoodItem = async (food_id) => {
    try {
        const token = await AsyncStorage.getItem("token"); // or wherever your token is stored

        if (!token) {
            throw new Error("User is not authenticated. Please log in.");
        }
        const response = await fetch(`${BASE_URL}/delete_food_items/${food_id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(food_id),
        });
        return response.json();
    } catch (error) {
        console.error("Error deleting food item:", error);
    }
}

export const updateFoodItem = async (food_id, new_data) => {
    try {
        const token = await AsyncStorage.getItem("token"); // or wherever your token is stored

        if (!token) {
            throw new Error("User is not authenticated. Please log in.");
        }
        const response = await fetch(`${BASE_URL}/update_food_item/${food_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(new_data),
        });
        return response.json();
    } catch (error) {
        console.error("Error updating food item:", error);
    }
}