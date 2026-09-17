import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Feather } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/context/AppContext';
import { Button, EmptyState, Header, ProgressBar, Screen, SectionTitle, uiStyles } from '@/components/UI';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, journeys } = useApp();
  useFocusEffect(useCallback(() => undefined, []));
  const active = journeys.find((journey) => journey.status === 'active');
  const frequent = useMemo(() => journeys.filter((journey) => journey.id !== active?.id).sort((a, b) => b.startCount - a.startCount || b.createdAt.localeCompare(a.createdAt)).slice(0, 3), [journeys, active?.id]);
  const openJourney = (journey: typeof journeys[number]) => journey.status === 'active' ? router.push({ pathname: '/journey/[id]', params: { id: journey.id } }) : router.push({ pathname: '/checklist/[id]', params: { id: journey.id } });
  return (
    <Screen>
      <Header title="Home" eyebrow="ENABLE SCOTLAND" />
      {active ? <Pressable accessibilityRole="button" accessibilityLabel={`Resume ${active.title}`} onPress={() => openJourney(active)} style={[styles.activeCard, { backgroundColor: colors.primary }]}><View style={styles.cardTop}><View style={[styles.badge, { backgroundColor: colors.accent }]}><Text style={[styles.badgeText, { color: colors.onAccent }]}>In progress</Text></View><Feather name="arrow-up-right" size={22} color={colors.onPrimary} /></View><Text style={[uiStyles.cardTitle, { color: colors.onPrimary }]}>{active.title}</Text><Text style={[uiStyles.body, { color: colors.onPrimary, opacity: 0.9 }]}>Step {Math.min(active.steps.findIndex((step) => !step.isDone) + 1 || active.steps.length, active.steps.length)} of {active.steps.length}</Text><ProgressBar current={active.steps.filter((step) => step.isDone).length} total={active.steps.length} /><Text style={[styles.cardHint, { color: colors.onPrimary }]}>Tap to continue</Text></Pressable> : <EmptyState title="No journey in progress" body="Choose a journey below to get started." action={journeys.length === 0 ? 'New Journey' : undefined} onAction={() => router.push('/create')} />}
      <SectionTitle title="Frequent journeys" action={journeys.length ? 'View all' : undefined} onAction={() => router.push('/journeys')} />
      {frequent.length ? frequent.map((journey) => <Pressable key={journey.id} accessibilityRole="button" accessibilityLabel={`Start ${journey.title}`} onPress={() => openJourney(journey)} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.divider }]}><View style={[styles.thumb, { backgroundColor: colors.primaryLight }]}>{journey.imageUri ? <Image source={{ uri: journey.imageUri }} style={StyleSheet.absoluteFill} /> : <Feather name="map" size={22} color={colors.primary} />}</View><View style={styles.rowText}><Text style={[uiStyles.cardTitle, { color: colors.text }]}>{journey.title}</Text><Text style={[uiStyles.body, { color: colors.textMuted }]}>{journey.steps.length} steps</Text></View><Feather name="chevron-right" size={22} color={colors.textMuted} /></Pressable>) : journeys.length === 0 ? <Text style={[uiStyles.body, { color: colors.textMuted }]}>You haven't made any journeys yet.</Text> : <Text style={[uiStyles.body, { color: colors.textMuted }]}>Your other journeys will appear here.</Text>}
      <SectionTitle title="Actions" />
      <View style={styles.actions}><Pressable accessibilityRole="button" accessibilityLabel="New Journey" onPress={() => router.push('/create')} style={[styles.actionTile, { backgroundColor: colors.primaryLight }]}><Feather name="plus" size={24} color={colors.primary} /><Text style={[uiStyles.cardTitle, { color: colors.primaryDark }]}>New Journey</Text><Text style={[styles.actionCopy, { color: colors.text }]}>Build a simple plan for your next trip.</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Checklist" onPress={() => router.push('/edit-checklist')} style={[styles.actionTile, { backgroundColor: colors.supportLight }]}><Feather name="check-square" size={24} color={colors.support} /><Text style={[uiStyles.cardTitle, { color: colors.text }]}>Checklist</Text><Text style={[styles.actionCopy, { color: colors.text }]}>Keep your before-you-go list ready.</Text></Pressable></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  activeCard: { borderRadius: 16, padding: 20, gap: 10, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  badgeText: { fontSize: 14, fontWeight: '700' },
  cardHint: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  row: { minHeight: 78, borderWidth: 1, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 56, height: 56, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowText: { flex: 1, gap: 3 },
  actions: { flexDirection: 'row', gap: 12 },
  actionTile: { flex: 1, borderRadius: 14, padding: 16, gap: 9, minHeight: 146 },
  actionCopy: { fontSize: 14, lineHeight: 20 },
});
