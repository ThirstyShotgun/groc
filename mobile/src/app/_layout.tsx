import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Palette } from '@/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Palette.bgPrimary },
          headerTintColor: Palette.textPrimary,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: Palette.bgPrimary },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="interview"
          options={{
            title: 'Mock Interview',
            headerBackTitle: 'Home',
          }}
        />
        <Stack.Screen
          name="dashboard"
          options={{
            title: 'Performance Dashboard',
            headerBackTitle: 'Home',
          }}
        />
      </Stack>
    </>
  );
}
