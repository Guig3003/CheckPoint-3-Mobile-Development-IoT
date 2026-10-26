import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { IoTProvider, useIoT } from '../context/IoTContext';

function RootNavigator() {
  const { colors, theme } = useIoT();

  return (
    <>
      <StatusBar
        animated
        style={theme === 'dark' ? 'light' : 'dark'}
      />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <IoTProvider>
        <RootNavigator />
      </IoTProvider>
    </SafeAreaProvider>
  );
}
