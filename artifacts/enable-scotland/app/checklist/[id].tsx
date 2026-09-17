import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Button, Header, Screen, uiStyles } from '@/components/UI';

export default function ChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, journeys, checklist, startJourney } = useApp();
  const journey = journeys.find((item) => item.id === id);
  const [checked, setChecked] = useState<string[]>([]);
  if (!journey) return <Screen><Header title="Before you go" /><Text style={[uiStyles.body, { color: colors.text }]}>This journey is no longer available.</Text></Screen>;
  const active = journeys.find((item) => item.status === 'active');
  const start = async () => {
    if (active && active.id !== journey.id) {
      Alert.alert('You have a journey in progress', `${active.title} is still in progress.`, [{ text: `Continue ${active.title}`, onPress: () => router.replace({ pathname: '/journey/[id]', params: { id: active.id } }) }, { text: 'Start new journey', onPress: async () => { await startJourney(journey.id); router.replace({ pathname: '/journey/[id]', params: { id: journey.id } }); } }, { text: 'Cancel', style: 'cancel' }]);
      return;
    }
    await startJourney(journey.id);
    router.replace({ pathname: '/journey/[id]', params: { id: journey.id } });
  };
  return <Screen><Header title="Before you go" eyebrow={journey.title} /><Text style={[uiStyles.body, { color: colors.text }]}>Take a moment to check what you need before you leave.</Text><View style={styles.list}>{checklist.map((item) => { const isChecked = checked.includes(item.id); return <Pressable key={item.id} accessibilityRole="checkbox" accessibilityLabel={item.label} accessibilityState={{ checked: isChecked }} onPress={() => setChecked((current) => isChecked ? current.filter((value) => value !== item.id) : [...current, item.id])} style={[styles.item, { borderColor: isChecked ? colors.primary : colors.divider, backgroundColor: isChecked ? colors.primaryLight : colors.surface }]}><Feather name={isChecked ? 'check-square' : 'square'} size={25} color={isChecked ? colors.primary : colors.border} /><Text style={[uiStyles.body, { color: colors.text, flex: 1 }]}>{item.label}</Text></Pressable>; })}</View>{checklist.length === 0 ? <Text style={[uiStyles.body, { color: colors.textMuted }]}>No checklist items today.</Text> : null}<Button label="Start Journey" onPress={start} icon="arrow-right" /><Pressable accessibilityRole="button" accessibilityLabel="Edit checklist" onPress={() => router.push('/edit-checklist')}><Text style={[styles.edit, { color: colors.primary }]}>Edit checklist</Text></Pressable></Screen>;
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  item: { minHeight: 64, borderWidth: 1.5, borderRadius: 11, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  edit: { fontSize: 16, fontWeight: '700', textAlign: 'center', padding: 10 },
});