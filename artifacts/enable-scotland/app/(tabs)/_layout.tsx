import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/context/AppContext';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
function SosTabButton({ onPress, accessibilityState }: { onPress?: React.ComponentProps<typeof Pressable>['onPress']; accessibilityState?: { selected?: boolean } }) {
  const { colors } = useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel="SOS" accessibilityState={accessibilityState} onPress={onPress} style={[styles.sosTab, { backgroundColor: colors.danger }]}><Text style={[styles.sosTabText, { color: colors.onDanger }]}>SOS</Text></Pressable>;
}
export default function TabLayout() {
  const { colors } = useApp();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.navText,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.nav,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          height: Platform.OS === 'web' ? 84 : 72,
          paddingBottom: Platform.OS === 'web' ? 30 : 9,
          paddingTop: 7,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Feather name="home" size={21} color={color} /> }} />
      <Tabs.Screen name="journeys" options={{ title: 'Journeys', tabBarIcon: ({ color }) => <Feather name="map" size={21} color={color} /> }} />
      <Tabs.Screen name="sos" options={{ title: '', tabBarButton: (props) => <SosTabButton onPress={props.onPress} accessibilityState={props.accessibilityState} /> }} />
      <Tabs.Screen name="help" options={{ title: 'Help', tabBarIcon: ({ color }) => <Feather name="help-circle" size={21} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Feather name="settings" size={21} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sosTab: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', marginTop: -17, borderWidth: 4, borderColor: '#FFFFFF', shadowColor: '#000000', shadowOpacity: 0.18, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  sosTabText: { fontSize: 15, fontWeight: '800' },
});
