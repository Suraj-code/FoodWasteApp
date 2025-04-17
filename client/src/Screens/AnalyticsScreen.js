import React from 'react';
import { View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Text } from 'react-native-paper';

// grab the device width
const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  // sample data
  const data = [
    { name: 'A', population: 30, color: '#f00', legendFontColor: '#000', legendFontSize: 12 },
    { name: 'B', population: 70, color: '#0f0', legendFontColor: '#000', legendFontSize: 12 },
  ];

  // minimal chartConfig
  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: () => `#000`,
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
        Analytics
      </Text>

      <PieChart
        data={data}
        width={screenWidth - 32}     // leave some padding
        height={200}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
}
