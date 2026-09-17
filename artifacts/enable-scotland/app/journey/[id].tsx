import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp, JourneyStep, MediaType } from '@/context/AppContext';
import { Button, Header, ProgressBar, Screen, uiStyles } from '@/components/UI';

export default function JourneyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, journeys, toggleStep, addMedia, removeMedia, completeJourney } = useApp();
  const journey = journeys.find((item) => item.id === id);
  if (!journey) return <Screen><Header title="Journey" /><Text style={[uiStyles.body, { color: colors.text }]}>This journey is no longer available.</Text></Screen>;
  const currentIndex = journey.steps.findIndex((step) => !step.isDone);
  const addPhoto = async (step: JourneyStep) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]?.uri) await addMedia(journey.id, step.id, { type: 'photo', uri: result.assets[0].uri });
  };
  const addNote = (step: JourneyStep) => {
    Alert.prompt?.('Add note', 'Write a short note for this step.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', onPress: (text?: string) => text?.trim() && addMedia(journey.id, step.id, { type: 'note', noteText: text.trim() }) }], 'plain-text');
  };
  const finish = () => {
    if (journey.steps.some((step) => !step.isDone)) Alert.alert("Some steps aren't ticked yet", 'Complete this journey anyway?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Complete', onPress: async () => { await completeJourney(journey.id); router.back(); } }]);
    else completeJourney(journey.id).then(() => router.back());
  };
  return <Screen><Header title={journey.title} eyebrow={journey.status === 'active' ? 'IN PROGRESS' : 'JOURNEY'} />{journey.status === 'active' ? <View style={styles.progressGroup}><Text style={[uiStyles.body, { color: colors.textMuted }]}>Step {Math.min(currentIndex + 1 || journey.steps.length, journey.steps.length)} of {journey.steps.length}</Text><ProgressBar current={journey.steps.filter((step) => step.isDone).length} total={journey.steps.length} /></View> : null}<View style={styles.steps}>{journey.steps.map((step, index) => <StepCard key={step.id} journeyId={journey.id} step={step} index={index} current={index === currentIndex} onToggle={() => toggleStep(journey.id, step.id)} onPhoto={() => addPhoto(step)} onNote={() => addNote(step)} onRemove={(type) => Alert.alert(`Remove this ${type}?`, undefined, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => removeMedia(journey.id, step.id, type) }])} colors={colors} />)}</View><Button label="Complete Journey" onPress={finish} icon="check-circle" /></Screen>;
}

function StepCard({ step, index, current, onToggle, onPhoto, onNote, onRemove, colors }: { journeyId: string; step: JourneyStep; index: number; current: boolean; onToggle: () => void; onPhoto: () => void; onNote: () => void; onRemove: (type: MediaType) => void; colors: ReturnType<typeof useApp>['colors'] }) {
  if (step.isDone) return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: true }} accessibilityLabel={`Mark step ${index + 1} not done`} onPress={onToggle} style={[styles.completed, { borderColor: colors.divider }]}><Feather name="check-circle" size={22} color={colors.success} /><Text style={[uiStyles.cardTitle, styles.struck, { color: colors.textMuted }]}>{step.title}</Text></Pressable>;
  const photo = step.media.find((item) => item.type === 'photo');
  const note = step.media.find((item) => item.type === 'note');
  return <View style={[styles.stepCard, { backgroundColor: current ? colors.primaryLight : colors.surface, borderColor: current ? colors.primary : colors.divider }]}><View style={styles.stepTop}><Text style={[styles.stepNumber, { color: colors.primary }]}>{index + 1}</Text><Text style={[uiStyles.cardTitle, { color: colors.text, flex: 1 }]}>{step.title}</Text><Pressable accessibilityRole="checkbox" accessibilityLabel={`Mark step ${index + 1} done`} accessibilityState={{ checked: false }} onPress={onToggle} hitSlop={8}><Feather name="circle" size={25} color={colors.primary} /></Pressable></View>{photo ? <View style={styles.previewRow}><Image accessibilityLabel={`Photo for step ${index + 1}: ${step.title}`} source={{ uri: photo.uri }} style={styles.previewImage} /><Pressable accessibilityLabel={`Remove photo from step ${index + 1}`} onPress={() => onRemove('photo')}><Feather name="x-circle" size={21} color={colors.danger} /></Pressable></View> : null}{note ? <View style={[styles.notePreview, { backgroundColor: colors.accentLight }]}><Text style={[uiStyles.body, { color: colors.text }]}>{note.noteText}</Text><Pressable accessibilityLabel={`Remove note from step ${index + 1}`} onPress={() => onRemove('note')}><Feather name="x-circle" size={21} color={colors.danger} /></Pressable></View> : null}{current ? <View style={styles.mediaActions}>{!photo ? <Pressable accessibilityRole="button" accessibilityLabel={`Add photo to step ${index + 1}`} onPress={onPhoto} style={[styles.mediaButton, { borderColor: colors.primary }]}><Feather name="image" size={17} color={colors.primary} /><Text style={[styles.mediaText, { color: colors.primary }]}>Photo</Text></Pressable> : null}{!note ? <Pressable accessibilityRole="button" accessibilityLabel={`Add note to step ${index + 1}`} onPress={onNote} style={[styles.mediaButton, { borderColor: colors.primary }]}><Feather name="edit-3" size={17} color={colors.primary} /><Text style={[styles.mediaText, { color: colors.primary }]}>Note</Text></Pressable> : null}<Text style={[styles.mediaHint, { color: colors.textMuted }]}>You can add one photo and one note</Text></View> : <Text style={[styles.mediaHint, { color: colors.textMuted }]}>Upcoming step</Text>}</View>;
}

const styles = StyleSheet.create({
  progressGroup: { gap: 8 },
  steps: { gap: 12 },
  stepCard: { borderRadius: 13, borderWidth: 1, padding: 15, gap: 13 },
  stepTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNumber: { fontSize: 16, fontWeight: '800', width: 25, height: 25, borderRadius: 13, textAlign: 'center', paddingTop: 2, backgroundColor: '#FFFFFF' },
  completed: { minHeight: 60, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
  struck: { textDecorationLine: 'line-through' },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewImage: { width: 72, height: 72, borderRadius: 12 },
  notePreview: { borderRadius: 9, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  mediaActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  mediaButton: { minHeight: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6 },
  mediaText: { fontSize: 14, fontWeight: '700' },
  mediaHint: { fontSize: 14, lineHeight: 20 },
});