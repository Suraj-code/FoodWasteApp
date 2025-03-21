import React, { useState, useEffect } from "react";
import { FlatList, View, StyleSheet, TouchableOpacity, Modal, TextInput, Button, ScrollView, Alert } from "react-native";
import { Text } from "react-native-paper";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dropdown } from "react-native-element-dropdown";
import { getFoodItems } from "../../config";
import { getCategoryNames } from "../../config";
import { addFoodItem } from "../../config";
import { deleteFoodItem } from "../../config";
import { updateFoodItem } from "../../config";


const PantryScreen = () => {
  const [pantryData, setPantryData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editFoodId, setEditFoodId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    category_id: "",
    purchase_date: "",
    expiration_date: "",
    storage_method: "",
  });

  //fetch data from the backend
  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    const data = await getFoodItems();
    console.log("Fetched Food Items:", data);

    // Fetch category names
    const categories = await getCategoryNames();
    console.log("Fetched Categories:", categories);

    // Group food items by category and associate category names
    if (data.length > 0 && categories.length > 0) {
      const groupedData = groupByCategory(data, categories);
      console.log(groupedData);
      setPantryData(groupedData);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategoryNames(); // getCategoryNames should return an array of categories
      console.log("Fetched Categories:", data);
  
      if (Array.isArray(data)) {
        setCategories(data.map(cat => ({ label: cat.name, value: cat.category_id.toString() })));
      } else {
        console.error("Categories data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (isEditing) {
      await updateItem(editFoodId, formData);
      setModalVisible(false);
    } else {
      const newItem = await addFoodItem(formData);
      console.log("New Food Item:", newItem);
      console.log("Form Data:", newItem.category_id);
      
      
      setPantryData((prevData) =>
        prevData.map((category) =>
          category.title === newItem.title
            ? { ...category, data: [...category.data, newItem] } // Add to correct category
            : category
        )
      );
      fetchData();
      setModalVisible(false);
      setFormData({ name: "", quantity: "", category_id: "", purchase_date: "", expiration_date: "", storage_method: "" });
      setIsEditing(false);
    }
    
  };

   // Function to group food items by category
   const groupByCategory = (items, categories) => {
    const categoryMap = {};  
  
    // Create a map of category_id to category name
    categories.forEach((category) => {
      categoryMap[category.category_id] = category.name;
    });
  
    const grouped = {};
  
    items.forEach((item) => {
      const categoryName = categoryMap[item.category_id] || "Uncategorized"; 
  
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(item);
    });
  
    return Object.keys(grouped).map((categoryName) => ({
      title: categoryName,
      data: grouped[categoryName],
    }));
  };

  const removeItem = async (category,itemId) => {
    const data = await deleteFoodItem(itemId);

    Alert.alert("Item Removed", "Item has been removed from the pantry")
    setPantryData((prevData) =>
      prevData.map((section) =>
        section.title === category
          ? { ...section, data: section.data.filter((item) => item.id !== itemId) }
          : section
      )
    );
    fetchData();
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      category_id: item.category_id.toString(),
      purchase_date: item.purchase_date,
      expiration_date: item.expiration_date,
      storage_method: item.storage_method,
    });
    setEditFoodId(item.food_id); // Store the ID for update
    setIsEditing(true);
    setModalVisible(true);
  };

  const updateItem = async (itemId, new_data) => {
    try {
      const data = await updateFoodItem(itemId, new_data); 

      console.log("Updated Item:", data);
  
      if (!data) {
        Alert.alert("Update Failed", "Something went wrong while updating the item.");
        return;
      }
  
      Alert.alert("Item Updated", "Item has been updated in the pantry");
  
      setPantryData((prevData) =>
        prevData.map((category) =>
          category.title === data.title
            ? { 
                ...category, 
                data: category.data.map((item) => 
                  item.id === itemId ? { ...item, ...data } : item 
                ) 
              }
            : category
        )
      );
  
      fetchData(); 
  
    } catch (error) {
      console.error("Error updating item:", error);
      Alert.alert("Error", "Failed to update item. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        <FlatList
          data={pantryData}
          scrollEnabled={false}
          keyExtractor={(item) => item.category_id}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              {/* Table Header */}
              <View style={styles.headerRow}>
                <Text style={[styles.cell, styles.header]}>item</Text>
                <Text style={[styles.cell, styles.header]}>Date Added</Text>
                <Text style={[styles.cell, styles.header]}>Expiry Date</Text>
                <Text style={[styles.cell, styles.header]}>Actions</Text>
              </View>
              {/* Table Content */}
              <FlatList
                data={item.data}
                keyExtractor={(subItem) => subItem.food_id}
                renderItem={({ item: subItem }) => (
                  <View style={styles.row}>
                    <Text style={styles.cell}>{subItem.name}</Text>
                    <Text style={styles.cell}>{new Date(subItem.purchase_date).toLocaleDateString()}</Text>
                    <Text style={styles.cell}>{new Date(subItem.expiration_date).toLocaleDateString()}</Text>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() => handleEdit(subItem)}
                        // style={styles.editBtn}
                      >
                        <Ionicons name={"pencil"} size={18} color={"black"} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeItem(item.title, subItem.food_id)}
                        // style={styles.removeBtn}
                      >
                        <Ionicons name={"trash-outline"} size={18} color={"black"} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </View>
          )}
        />
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addBtn}
        >
          <Ionicons name={"add-circle"} size={30} color={"black"} />
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Food Item</Text>

              <TextInput style={styles.input} placeholder="Name" onChangeText={(text) => handleChange("name", text)} value={formData.name} />
              <TextInput style={styles.input} placeholder="Quantity" onChangeText={(text) => handleChange("quantity", text)} value={formData.quantity} keyboardType="numeric" />
              
              <Dropdown
                style={styles.dropdown}
                data={categories}
                labelField="label"
                valueField="value"
                placeholder="Select Category"
                value={formData.category_id}
                onChange={(item) => {
                  console.log("Selected Category:", item);
                  handleChange("category_id", item.value)
                }}
              />
              
              <TextInput style={styles.input} placeholder="Purchase Date (YYYY-MM-DD)" onChangeText={(text) => handleChange("purchase_date", text)} value={formData.purchase_date} />
              <TextInput style={styles.input} placeholder="Expiration Date (YYYY-MM-DD)" onChangeText={(text) => handleChange("expiration_date", text)} value={formData.expiration_date} />
              <TextInput style={styles.input} placeholder="Storage Method" onChangeText={(text) => handleChange("storage_method", text)} value={formData.storage_method} />

              <View style={styles.buttonContainer}>
                <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
                <Button title="Add Item" onPress={handleSubmit} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

// Function to check if an item is expired
const isExpired = (expiryDate) => {
  const today = new Date().toISOString().split("T")[0];
  return expiryDate < today;
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 8,
    alignItems: "center",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
  header: {
    fontWeight: "bold",
  },
  expired: {
    color: "red",
  },
  actions: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-evenly",
  },
  editBtn: {
    backgroundColor: "blue",
    padding: 5,
    borderRadius: 5,
  },
  removeBtn: {
    backgroundColor: "red",
    padding: 5,
    borderRadius: 5,
  },
  addBtn: {
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  btnText: {
    color: "#fff",
    fontSize: 12,
  },
  addButton: { position: "absolute", bottom: 20, right: 20 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, width: "100%" },
  dropdown: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, width: "100%", borderRadius: 5 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between" },
});

export default PantryScreen;
