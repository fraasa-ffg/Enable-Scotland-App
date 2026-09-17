import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Button, EmptyState, Header, Screen, uiStyles } from '@/components/UI';

export default function JourneysScreen() {
  const router = useRouter();
  const { colors, journeys, deleteJourney } = useApp();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => journeys.filter((journey) => journey.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(query.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''))).sort((a, b) => (a.status === 'active' ? -1 : b.status === 'active' ? 1 : b.createdAt.localeCompare(a.createdAt))), [journeys, query]);
  const confirmDelete = (journey: typeof journeys[number]) => Alert.alert('Delete journey?', `Are you sure you want to delete ${journey.title}? Its steps, photos, videos, voice notes and notes will be deleted too.${journey.status === 'active' ? '\n\nThis journey is in progress.' : ''}`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteJourney(journey.id) }]);
  return (
    <Screen>
      <Header title="My journeys" eyebrow="YOUR PLANS" />
      <View style={[styles.search, { borderColor: colors.border, backgroundColor: colors.surface }]}><Feather name="search" size={19} color={colors.textMuted} /><TextInput accessibilityLabel="Search journeys" placeholder="Search journeys" placeholderTextColor={colors.textMuted} value={query} onChangeText={setQuery} style={[styles.searchInput, { color: colors.text }]} />{query ? <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}><Feather name="x-circle" size={20} color={colors.textMuted} /></Pressable> : null}</View>
      {!journeys.length ? <EmptyState title="No journeys yet" body="You haven't made any journeys yet." action="Create New Journey" onAction={() => router.push('/create')} /> : !filtered.length ? <Text style={[uiStyles.body, { color: colors.textMuted }]}>No journeys match “{query}”.</Text> : filtered.map((journey) => <Pressable key={journey.id} accessibilityRole="button" accessibilityLabel={`${journey.title}. Swipe left to delete`} accessibilityHint="Swipe left or use the delete button to delete" accessibilityActions={[{ name: 'delete', label: 'Delete' }]} onAccessibilityAction={() => confirmDelete(journey)} onPress={() => router.push(journey.status === 'active' ? { pathname: '/journey/[id]', params: { id: journey.id } } : { pathname: '/checklist/[id]', params: { id: journey.id } })} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.divider }]}><View style={[styles.thumb, { backgroundColor: colors.primaryLight }]}>{journey.imageUri ? <Image source={{ uri: journey.imageUri }} style={StyleSheet.absoluteFill} /> : <Feather name="map" size={22} color={colors.primary} />}</View><View style={styles.rowCopy}><View style={styles.titleLine}><Text style={[uiStyles.cardTitle, { color: colors.text, flex: 1 }]}>{journey.title}</Text>{journey.status === 'active' ? <Text style={[styles.badge, { backgroundColor: colors.accentLight, color: colors.accent }]}>In progress</Text> : null}</View><Text style={[uiStyles.body, { color: colors.textMuted }]}>{journey.status === 'active' ? `Step ${journey.steps.filter((step) => step.isDone).length + 1} of ${journey.steps.length}` : `${journey.steps.length} steps`}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Delete ${journey.title}`} hitSlop={8} onPress={() => confirmDelete(journey)} style={styles.delete}><Feather name="trash-2" size={19} color={colors.danger} /></Pressable></Pressable>)}
      <Button label="Create New Journey" onPress={() => router.push('/create')} icon="plus" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { borderWidth: 1.5, minHeight: 52, borderRadius: 8, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, fontSize: 16 },
  row: { minHeight: 84, borderWidth: 1, borderRadius: 12, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 58, height: 58, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowCopy: { flex: 1, gap: 4 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { fontSize: 12, fontWeight: '700', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 4 },
  delete: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});