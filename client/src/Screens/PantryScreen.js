import React, { useState, useEffect } from "react";
import { FlatList, View, StyleSheet, TouchableOpacity, Modal, TextInput, Button, ScrollView, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { Text } from "react-native-paper";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dropdown } from "react-native-element-dropdown";
import { getFoodItems } from "../../config";
import { getCategoryNames } from "../../config";
import { addFoodItem } from "../../config";
import { deleteFoodItem } from "../../config";
import { updateFoodItem } from "../../config";
// import { DateTimePicker } from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";


const PantryScreen = () => {
  const [pantryData, setPantryData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isDPVisible, setIsDPVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  //fetch data from the backend
  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching data...");
      
      const data = await getFoodItems();
      console.log("Fetched Food Items:", data);

      const categories = await getCategoryNames();
      console.log("Fetched Categories:", categories);

      if (data && categories) {
        const groupedData = groupByCategory(data, categories);
        console.log("Grouped Data:", groupedData);
        setPantryData(groupedData);
      } else {
        throw new Error("Invalid data received from server");
      }
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError("Failed to fetch pantry data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setError(null);
      const data = await getCategoryNames();
      console.log("Fetched Categories:", data);
  
      if (Array.isArray(data)) {
        setCategories(data.map(cat => ({ label: cat.name, value: cat.category_id.toString() })));
      } else {
        throw new Error("Invalid categories data format");
      }
    } catch (error) {
      setError("Failed to fetch categories. Please try again later.");
      console.error("Error fetching categories:", error);
    }
  };
  

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.quantity.trim()) {
      errors.quantity = "Quantity is required";
    } else if (isNaN(formData.quantity) || Number(formData.quantity) <= 0) {
      errors.quantity = "Quantity must be a positive number";
    }
    
    if (!formData.category_id) {
      errors.category_id = "Category is required";
    }
    
    if (!formData.purchase_date) {
      errors.purchase_date = "Purchase date is required";
    }
    
    if (!formData.expiration_date) {
      errors.expiration_date = "Expiration date is required";
    } else if (formData.expiration_date < formData.purchase_date) {
      errors.expiration_date = "Expiration date must be after purchase date";
    }
    
    if (!formData.storage_method.trim()) {
      errors.storage_method = "Storage method is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (isEditing) {
      await updateItem(editFoodId, formData);
      setModalVisible(false);
    } else {
      const newItem = await addFoodItem(formData);
      console.log("New Food Item:", newItem);
      
      setPantryData((prevData) =>
        prevData.map((category) =>
          category.title === newItem.title
            ? { ...category, data: [...category.data, newItem] }
            : category
        )
      );
      setModalVisible(false);
      setFormData({ name: "", quantity: "", category_id: "", purchase_date: "", expiration_date: "", storage_method: "" });
      setFormErrors({});
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

  const removeItem = async (category, itemId) => {
    try {
      console.log("Attempting to delete item:", itemId, "from category:", category);
      
      // Make the API call first
      const response = await deleteFoodItem(itemId);
      console.log("Delete API response:", response);
      
      if (!response) {
        Alert.alert("Error", "Failed to delete item. Please try again.");
        return;
      }

      // Only update the state after successful API call
      setPantryData((prevData) => {
        return prevData.map((section) => {
          if (section.title === category) {
            return {
              ...section,
              data: section.data.filter((item) => item.food_id !== itemId)
            };
          }
          return section;
        });
      });

      Alert.alert("Success", "Item has been removed from the pantry");
      
    } catch (error) {
      console.error("Error in removeItem:", error);
      Alert.alert("Error", "Failed to delete item. Please try again.");
    }
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
        prevData.map((category) => ({
          ...category,
          data: category.data.map((item) => 
            item.food_id === itemId ? { ...item, ...data } : item
          )
        }))
      );
      
      setIsEditing(false); 
      setFormData({ name: "", quantity: "", category_id: "", purchase_date: "", expiration_date: "", storage_method: "" });
      setModalVisible(false);
      
      // Refresh data to ensure consistency
      fetchData();
  
    } catch (error) {
      console.error("Error updating item:", error);
      Alert.alert("Error", "Failed to update item. Please try again.");
    }
  };

  // const handleDateChange = (field, selectedDate) => {
  //   console.log("Selected Date:", selectedDate);
  //   setFormData((prevData) => ({
  //     ...prevData, // Keep existing data
  //     [field]: selectedDate.toISOString().split("T")[0], // Format date to YYYY-MM-DD
  //   }));
  //   setIsDPVisible(false);
  // };
  
  const showDatePicker = (field) => {
    DateTimePickerAndroid.open({
      value: date,
      mode: "date",
      display: "default",
      onChange: (event, selectedDate) => {
        if (selectedDate) {
          setFormData((prevData) => ({
            ...prevData,
            [field]: selectedDate.toISOString().split("T")[0], // Store as YYYY-MM-DD
          }));
        }
      },
    });
  };
  

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Loading pantry data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={fetchData} />
          </View>
        ) : (
          <FlatList
            data={pantryData}
            scrollEnabled={false}
            keyExtractor={(item) => item.title}
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
                  keyExtractor={(subItem) => subItem.food_id.toString()}
                  renderItem={({ item: subItem }) => {
                    const isItemExpired = isExpired(subItem.expiration_date);
                    return (
                      <View style={[styles.row, isItemExpired && styles.expiredRow]}>
                        <Text style={[styles.cell, isItemExpired && styles.expiredText]}>{subItem.name}</Text>
                        <Text style={[styles.cell, isItemExpired && styles.expiredText]}>{new Date(subItem.purchase_date).toISOString().split("T")[0]}</Text>
                        <Text style={[styles.cell, isItemExpired && styles.expiredText]}>{new Date(subItem.expiration_date).toISOString().split("T")[0]}</Text>
                        <View style={styles.actions}>
                          <TouchableOpacity
                            onPress={() => handleEdit(subItem)}
                          >
                            <Ionicons name={"pencil"} size={18} color={isItemExpired ? "red" : "black"} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                "Delete Item",
                                "Are you sure you want to delete this item?",
                                [
                                  {
                                    text: "Cancel",
                                    style: "cancel"
                                  },
                                  {
                                    text: "Delete",
                                    onPress: () => removeItem(item.title, subItem.food_id),
                                    style: "destructive"
                                  }
                                ]
                              );
                            }}
                          >
                            <Ionicons name={"trash-outline"} size={18} color={isItemExpired ? "red" : "black"} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                />
              </View>
            )}
          />
        )}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addBtn}
        >
          <Ionicons name={"add-circle"} size={30} color={"black"} />
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{isEditing ? "Edit Food Item" : "Add Food Item"}</Text>
              
              <ScrollView style={styles.modalScroll}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput 
                    style={[styles.input, formErrors.name && styles.inputError]} 
                    placeholder="Enter item name" 
                    onChangeText={(text) => handleChange("name", text)} 
                    value={formData.name}
                  />
                  {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput 
                    style={[styles.input, formErrors.quantity && styles.inputError]} 
                    placeholder="Enter quantity" 
                    onChangeText={(text) => handleChange("quantity", text)} 
                    value={formData.quantity} 
                    keyboardType="numeric"
                  />
                  {formErrors.quantity && <Text style={styles.errorText}>{formErrors.quantity}</Text>}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Category</Text>
                  <Dropdown
                    style={[styles.dropdown, formErrors.category_id && styles.inputError]}
                    data={categories}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Category"
                    value={formData.category_id}
                    onChange={(item) => handleChange("category_id", item.value)}
                  />
                  {formErrors.category_id && <Text style={styles.errorText}>{formErrors.category_id}</Text>}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Purchase Date</Text>
                  <TouchableOpacity onPress={() => showDatePicker("purchase_date")}>
                    <TextInput 
                      style={[styles.input, formErrors.purchase_date && styles.inputError]} 
                      placeholder="Select purchase date" 
                      value={formData.purchase_date} 
                      editable={false}
                    />
                  </TouchableOpacity>
                  {formErrors.purchase_date && <Text style={styles.errorText}>{formErrors.purchase_date}</Text>}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TouchableOpacity onPress={() => showDatePicker("expiration_date")}>
                    <TextInput 
                      style={[styles.input, formErrors.expiration_date && styles.inputError]} 
                      placeholder="Select expiry date" 
                      value={formData.expiration_date} 
                      editable={false}
                    />
                  </TouchableOpacity>
                  {formErrors.expiration_date && <Text style={styles.errorText}>{formErrors.expiration_date}</Text>}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Storage Method</Text>
                  <TextInput 
                    style={[styles.input, formErrors.storage_method && styles.inputError]} 
                    placeholder="Enter storage method" 
                    onChangeText={(text) => handleChange("storage_method", text)} 
                    value={formData.storage_method}
                  />
                  {formErrors.storage_method && <Text style={styles.errorText}>{formErrors.storage_method}</Text>}
                </View>

                <View style={styles.buttonContainer}>
                  <Button title="Cancel" color="red" onPress={() => {
                    setModalVisible(false);
                    setFormErrors({});
                  }} />
                  <Button title={isEditing ? "Update" : "Add"} onPress={handleSubmit} />
                </View>
              </ScrollView>
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
  modalContent: { 
    backgroundColor: "white", 
    padding: 20, 
    borderRadius: 10, 
    width: "90%",
    maxHeight: '90%',
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, width: "100%" },
  dropdown: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, width: "100%", borderRadius: 5 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between" },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  expiredRow: {
    backgroundColor: '#fff0f0',
  },
  expiredText: {
    color: 'red',
  },
  modalScroll: {
    maxHeight: '80%',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
});

export default PantryScreen;
