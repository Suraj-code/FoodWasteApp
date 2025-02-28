const BASE_URL = "http://127.0.0.1:5000";

export const getFoodItems = async () => {
    try {
      const response = await fetch(`${BASE_URL}/get_food`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
  };
  
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