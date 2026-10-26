import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useIoT } from '../../context/IoTContext';

export default function TabsLayout() {
  const { colors } = useIoT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          height: 68,
          paddingTop: 7,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarAccessibilityLabel: 'Abrir Dashboard',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              color={focused ? colors.primary : colors.textSubtle}
              name={focused ? 'grid' : 'grid-outline'}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarAccessibilityLabel: 'Abrir histórico de mensagens',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              color={focused ? colors.primary : colors.textSubtle}
              name={focused ? 'time' : 'time-outline'}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarAccessibilityLabel: 'Abrir configurações',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              color={focused ? colors.primary : colors.textSubtle}
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
