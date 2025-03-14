import React, { useState, useEffect } from "react";
import { FlatList, View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getFoodItems } from "../../config";
import { getCategoryNames } from "../../config";


const PantryScreen = () => {
  const [pantryData, setPantryData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  //fetch data from the backend
  useEffect(() => {
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

    fetchData();
  }, []);

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

  // const removeItem = (category, itemId) => {
  //   setPantryData((prevData) =>
  //     prevData.map((section) =>
  //       section.title === category
  //         ? { ...section, data: section.data.filter((item) => item.id !== itemId) }
  //         : section
  //     )
  //   );
  // };

  return (
    <View style={styles.container}>
      <FlatList
        data={pantryData}
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
                      onPress={() => alert(`Edit ${item.name}`)}
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
    </View>
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
  btnText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default PantryScreen;
