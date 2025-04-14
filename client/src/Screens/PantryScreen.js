import React, { useState, useEffect } from "react";
import { FlatList, View, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert, ActivityIndicator, RefreshControl, Animated } from "react-native";
import { Text, Card, useTheme, IconButton, Button } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dropdown } from "react-native-element-dropdown";
import { getFoodItems } from "../../config";
import { getCategoryNames } from "../../config";
import { addFoodItem } from "../../config";
import { deleteFoodItem } from "../../config";
import { updateFoodItem } from "../../config";
// import { DateTimePicker } from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Add color mapping for categories
const categoryColors = {
  'Dairy Products': '#4c669f',      // Blue
  'Meat & Poultry': '#ff4444',       // Red
  'Fruits': '#00C851',    // Green
  'Grains & Cereals': '#ffbb33',     // Yellow
  'Snacks': '#aa66cc',     // Purple
  'Beverages': '#33b5e5',  // Light Blue
  'Vegetables': '#2BBBAD',     // Teal
  'Canned Goods': '#ff8800',     // Orange
  'Baked Goods': '#ff3547',     // Pink
  'Seafood': '#64b5f6',    // Light Blue
  'Ready-to-Eat Meals': '#795548',    // Brown
  'Spices & Herbs': '#9C27B0',    // Deep Purple
  'Nuts & Seeds': '#8D6E63',    // Light Brown
  'Frozen Foods': '#00BCD4',    // Cyan
  'Sauces & Condiments': '#E91E63',    // Magenta
  'Uncategorized': '#607D8B'    // Blue Grey
};

// Add category icons mapping
const categoryIcons = {
  'Dairy Products': 'nutrition',
  'Meat & Poultry': 'restaurant',
  'Fruits': 'leaf',
  'Grains & Cereals': 'basket',
  'Snacks': 'fast-food',
  'Beverages': 'cafe',
  'Vegetables': 'leaf',
  'Canned Goods': 'can',
  'Baked Goods': 'bread',
  'Seafood': 'fish',
  'Ready-to-Eat Meals': 'restaurant',
  'Spices & Herbs': 'flask',
  'Nuts & Seeds': 'nutrition',
  'Frozen Foods': 'snow',
  'Sauces & Condiments': 'flask',
  'Uncategorized': 'cube'
};

// Create a separate component for the category section
const CategorySection = ({ category, handleEdit, removeItem }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const categoryColor = categoryColors[category.title] || categoryColors['Uncategorized'];
  const categoryIcon = categoryIcons[category.title] || 'cube';

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
      <View style={[styles.sectionHeader, { backgroundColor: categoryColor }]}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={categoryIcon} size={24} color="#fff" />
          </View>
          <Text style={styles.sectionTitle}>{category.title}</Text>
        </View>
        <View style={styles.sectionHeaderRight}>
          <View style={[styles.itemCountBadge, { backgroundColor: categoryColor + '40' }]}>
            <Text style={styles.itemCountBadgeText}>{category.data.length}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.tableContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerCell}>Item</Text>
          <Text style={styles.headerCell}>Added</Text>
          <Text style={styles.headerCell}>Expires</Text>
          <Text style={styles.headerCell}>Actions</Text>
        </View>
        
        <FlatList
          data={category.data}
          keyExtractor={(item) => item.food_id.toString()}
          renderItem={({ item }) => {
            const isExpired = new Date(item.expiration_date) < new Date();
            const isExpiringSoon = new Date(item.expiration_date) < new Date(new Date().setDate(new Date().getDate() + 7));
            
            return (
              <View style={[
                styles.row,
                isExpired && styles.expiredRow,
                isExpiringSoon && !isExpired && styles.expiringSoonRow
              ]}>
                <Text style={[styles.cell, isExpired && styles.expiredText]}>{item.name}</Text>
                <Text style={[styles.cell, isExpired && styles.expiredText]}>
                  {new Date(item.purchase_date).toLocaleDateString()}
                </Text>
                <Text style={[styles.cell, isExpired && styles.expiredText]}>
                  {new Date(item.expiration_date).toLocaleDateString()}
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: categoryColor + '20' }]}
                    onPress={() => handleEdit(item)}
                  >
                    <Ionicons name="pencil" size={20} color={categoryColor} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#ff444420' }]}
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
                            onPress: () => removeItem(category.title, item.food_id),
                            style: "destructive"
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>
    </Animated.View>
  );
};

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
  const navigation = useNavigation();
  const theme = useTheme();

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
      
      // Clear any cached data before fetching
      setPantryData([]);
      setCategories([]);
      
      // Get the current token
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

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
      if (err.message.includes("No authentication token")) {
        setError("Session expired. Please log in again.");
        // Optionally navigate to login screen
        navigation.navigate('Login');
      } else {
        setError("Failed to fetch pantry data. Please try again later.");
      }
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

    try {
      if (isEditing) {
        await updateItem(editFoodId, formData);
        setModalVisible(false);
      } else {
        const newItem = await addFoodItem(formData);
        console.log("New Food Item:", newItem);
        
        // Find the category name for the new item
        const categoryName = categories.find(cat => cat.value === formData.category_id)?.label || "Uncategorized";
        
        setPantryData(prevData => {
          // Check if the category already exists
          const categoryIndex = prevData.findIndex(cat => cat.title === categoryName);
          
          if (categoryIndex !== -1) {
            // Category exists, add the new item to it
            const updatedData = [...prevData];
            updatedData[categoryIndex] = {
              ...updatedData[categoryIndex],
              data: [...updatedData[categoryIndex].data, newItem]
            };
            return updatedData;
          } else {
            // Category doesn't exist, create a new category with the item
            return [...prevData, { title: categoryName, data: [newItem] }];
          }
        });

        setModalVisible(false);
        setFormData({ name: "", quantity: "", category_id: "", purchase_date: "", expiration_date: "", storage_method: "" });
        setFormErrors({});
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      Alert.alert("Error", "Failed to save the item. Please try again.");
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
      name: item.name || '',
      quantity: item.quantity ? item.quantity.toString() : '',
      category_id: item.category_id ? item.category_id.toString() : '',
      purchase_date: item.purchase_date || '',
      expiration_date: item.expiration_date || '',
      storage_method: item.storage_method || '',
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

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your pantry...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchData}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      ) : pantryData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={64} color={theme.colors.primary} />
          <Text style={styles.emptyTitle}>Your Pantry is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Start by adding some food items to track your inventory
          </Text>
          {/* <Button 
            mode="contained" 
            onPress={() => setModalVisible(true)}
            style={styles.addButton}
            icon="plus"
          >
            "Add Your First Item"
          </Button> */}
        </View>
      ) : (
        <FlatList
          data={pantryData}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <CategorySection
              category={item}
              handleEdit={handleEdit}
              removeItem={removeItem}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchData}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.addButtonContent}>
          <Ionicons name="add" size={30} color="#fff" />
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Edit Food Item" : "Add Food Item"}
              </Text>
            </View>

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

              <View style={styles.modalButtons}>
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    setModalVisible(false);
                    setFormData({ name: '', quantity: '', category_id: '', purchase_date: '', expiration_date: '', storage_method: '' });
                    setIsEditing(false);
                  }}
                  style={[styles.modalButton, { borderColor: 'red' }]}
                  textColor="red"
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSubmit}
                  style={styles.modalButton}
                >
                  {isEditing ? "Update" : "Add"}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Function to check if an item is expired
const isExpired = (expiryDate) => {
  const today = new Date().toISOString().split("T")[0];
  return expiryDate < today;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  flatListContent: {
    padding: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 10,
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionHeader: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 70,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionHeaderRight: {
    marginLeft: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  itemCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCountBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tableContainer: {
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  expiredRow: {
    backgroundColor: '#fff0f0',
  },
  expiringSoonRow: {
    backgroundColor: '#fff8e1',
  },
  expiredText: {
    color: '#ff4444',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#4c669f',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonContent: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    backgroundColor: '#4c669f',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalScroll: {
    padding: 20,
  },
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
    marginTop: 10,
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4c669f',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  formGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    padding: 10, 
    marginBottom: 10, 
    width: "100%",
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  dropdown: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    padding: 10, 
    marginBottom: 10, 
    width: "100%", 
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
});

export default PantryScreen;
