import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Button, Header, Screen, TextField, uiStyles } from '@/components/UI';

export default function EditChecklistScreen() {
  const router = useRouter();
  const { colors, checklist, updateChecklist, addChecklistItem, removeChecklistItem } = useApp();
  return <Screen><Header title="Edit journey checklist" eyebrow="BEFORE YOU GO" /><Text style={[uiStyles.body, { color: colors.textMuted }]}>Changes are saved as you edit. They will apply the next time you start a journey.</Text><View style={styles.list}>{checklist.map((item) => <View key={item.id} style={styles.row}><View style={styles.input}><TextField label="Checklist item" value={item.label} onChangeText={(value) => updateChecklist(item.id, value)} /></View><Pressable accessibilityRole="button" accessibilityLabel={`Remove ${item.label}`} onPress={() => removeChecklistItem(item.id)} hitSlop={8}><Feather name="trash-2" size={20} color={colors.danger} /></Pressable></View>)}</View><Button label="Add item" onPress={addChecklistItem} variant="secondary" icon="plus" /><Text style={[styles.saved, { color: colors.success }]}>Saved automatically</Text><Button label="Done" onPress={() => router.back()} /></Screen>;
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1 },
  saved: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
});