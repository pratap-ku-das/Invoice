import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { materialTheme } from './src/theme/materialTheme';
import DashboardScreen from './src/screens/DashboardScreen';
import InvoicesScreen from './src/screens/InvoicesScreen';
import CustomersScreen from './src/screens/CustomersScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={materialTheme}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#4f46e5' },
              headerTintColor: '#ffffff',
              headerTitleStyle: { fontWeight: 'bold' },
              tabBarActiveTintColor: '#4f46e5',
              tabBarInactiveTintColor: '#64748b',
              tabBarStyle: { height: 60, paddingBottom: 8 },
            }}
          >
            <Tab.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                title: 'BalajiOne ERP',
                tabBarIcon: ({ color, size }) => <Icon name="view-dashboard" color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="Invoices"
              component={InvoicesScreen}
              options={{
                title: 'Invoices',
                tabBarIcon: ({ color, size }) => <Icon name="file-document-outline" color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="Customers"
              component={CustomersScreen}
              options={{
                title: 'Customers',
                tabBarIcon: ({ color, size }) => <Icon name="account-group" color={color} size={size} />,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
