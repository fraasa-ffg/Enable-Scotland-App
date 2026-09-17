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
      {active ? <Pressable accessibilityRole="button" accessibilityLabel={`Resume ${active.title}`} onPress={() => openJourney(active)} style={[styles.activeCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>{active.imageUri ? <Image accessibilityLabel={`Photo for ${active.title}`} source={{ uri: active.imageUri }} style={styles.activeImage} /> : <View style={[styles.activeImage, { backgroundColor: colors.primaryLight }]}><Feather name="map" size={30} color={colors.primary} /></View>}<View style={[styles.activeInfo, { backgroundColor: colors.primary }]}><View style={styles.cardTop}><Text style={[styles.activeLabel, { color: colors.accentLight }]}>↗ ACTIVE JOURNEY</Text><Feather name="chevron-right" size={20} color={colors.onPrimary} /></View><Text style={[uiStyles.cardTitle, { color: colors.onPrimary }]}>{active.title}</Text><Text style={[uiStyles.body, { color: colors.onPrimary, opacity: 0.9 }]}>Step {Math.min(active.steps.findIndex((step) => !step.isDone) + 1 || active.steps.length, active.steps.length)} of {active.steps.length}</Text><ProgressBar current={active.steps.filter((step) => step.isDone).length} total={active.steps.length} /></View></Pressable> : <EmptyState title="No journey in progress" body="Choose a journey below to get started." action={journeys.length === 0 ? 'New Journey' : undefined} onAction={() => router.push('/create')} />}
      <SectionTitle title="Frequent journeys" action={journeys.length ? 'View all' : undefined} onAction={() => router.push('/journeys')} />
      {frequent.length ? frequent.map((journey) => <Pressable key={journey.id} accessibilityRole="button" accessibilityLabel={`Start ${journey.title}`} onPress={() => openJourney(journey)} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.divider }]}><View style={[styles.thumb, { backgroundColor: colors.primaryLight }]}>{journey.imageUri ? <Image source={{ uri: journey.imageUri }} style={StyleSheet.absoluteFill} /> : <Feather name="map" size={22} color={colors.primary} />}</View><View style={styles.rowText}><Text style={[uiStyles.cardTitle, { color: colors.text }]}>{journey.title}</Text><Text style={[uiStyles.body, { color: colors.textMuted }]}>{journey.steps.length} steps</Text></View><Feather name="chevron-right" size={22} color={colors.textMuted} /></Pressable>) : journeys.length === 0 ? <Text style={[uiStyles.body, { color: colors.textMuted }]}>You haven't made any journeys yet.</Text> : <Text style={[uiStyles.body, { color: colors.textMuted }]}>Your other journeys will appear here.</Text>}
      <SectionTitle title="Actions" />
      <View style={styles.actions}><Pressable accessibilityRole="button" accessibilityLabel="New Journey" onPress={() => router.push('/create')} style={[styles.actionTile, { backgroundColor: colors.primary }]}><View style={[styles.actionIcon, { backgroundColor: colors.onPrimary }]}><Feather name="plus" size={20} color={colors.primary} /></View><Text style={[uiStyles.cardTitle, { color: colors.onPrimary }]}>New Journey</Text><Text style={[styles.actionCopy, { color: colors.onPrimary }]}>Plan where you are going</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Checklist" onPress={() => router.push('/edit-checklist')} style={[styles.actionTile, { backgroundColor: colors.primaryLight }]}><View style={[styles.actionIcon, { backgroundColor: colors.accentLight }]}><Feather name="check-circle" size={20} color={colors.primary} /></View><Text style={[uiStyles.cardTitle, { color: colors.primary }]}>Checklist</Text><Text style={[styles.actionCopy, { color: colors.primary }]}>Review saved journey tasks</Text></Pressable></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  activeCard: { borderRadius: 8, overflow: 'hidden', borderWidth: 1, shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  activeImage: { width: '100%', height: 112, alignItems: 'center', justifyContent: 'center' },
  activeInfo: { padding: 12, gap: 5 },
  activeLabel: { fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 0.4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  badgeText: { fontSize: 14, fontWeight: '700' },
  cardHint: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  row: { minHeight: 78, borderWidth: 1, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 56, height: 56, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowText: { flex: 1, gap: 3 },
  actions: { flexDirection: 'row', gap: 12 },
  actionTile: { flex: 1, borderRadius: 8, padding: 12, gap: 7, minHeight: 116 },
  actionIcon: { width: 36, height: 36, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  actionCopy: { fontSize: 12, lineHeight: 16 },
});
