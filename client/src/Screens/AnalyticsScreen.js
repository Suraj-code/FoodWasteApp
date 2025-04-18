import React from 'react';
import { View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Text } from 'react-native-paper';
import { calculateStats } from '../utils/Stats';
import { getFoodItems } from '../../config'; // Assuming same API

// grab the device width
const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const [pantryData, setPantryData] = React.useState([]);

  React.useEffect(() => {
    const fetchPantryData = async () => {
      const items = await getFoodItems();
      console.log(items)
      setPantryData(items || []);
    };

    fetchPantryData();
  }, []);

  const stats = calculateStats(pantryData);
  const categoryData = Object.entries(stats.categoryCounts).map(([name, population], index) => ({
    name,
    population,
    color: ['#ff6384', '#36a2eb', '#ffce56', '#4caf50', '#f44336'][index % 5],
    legendFontColor: '#000',
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundGradientFrom: '#e0f7fa',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: () => `#000`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      // Optional: Customize label properties
      fontSize: 12,
      fontWeight: 'bold',
    },
  };


  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 16, fontWeight: 'bold', color: '#333' }}>
        Analytics Overview
      </Text>

      <PieChart
        data={categoryData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={{ borderRadius: 16 }}
      />
    </View>
  );
}
