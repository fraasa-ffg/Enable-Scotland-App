import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StepMediaPreviews, NoteEditor, VoiceRecorderButton } from '@/components/StepMedia';
import { useApp, JourneyStep, Media, MediaType } from '@/context/AppContext';
import { Button, Header, ProgressBar, Screen, uiStyles } from '@/components/UI';

export default function JourneyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, journeys, toggleStep, addMedia, removeMedia, completeJourney } = useApp();
  const [noteStepId, setNoteStepId] = useState<string | null>(null);
  const journey = journeys.find((item) => item.id === id);
  if (!journey) return <Screen><Header title="Journey" /><Text style={[uiStyles.body, { color: colors.text }]}>This journey is no longer available.</Text></Screen>;
  const currentIndex = journey.steps.findIndex((step) => !step.isDone);

  const addVisual = async (step: JourneyStep) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photos permission needed', "We can't access your photos and videos. You can still add a voice note or written note instead.", [{ text: 'OK' }]);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.8 });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset?.uri) return;
    await addMedia(journey.id, step.id, { type: asset.type === 'video' ? 'video' : 'photo', uri: asset.uri });
  };
  const addVoice = async (step: JourneyStep, media: Media) => {
    await addMedia(journey.id, step.id, media);
  };
  const addNote = async (step: JourneyStep, text: string) => {
    await addMedia(journey.id, step.id, { type: 'note', noteText: text });
  };
  const confirmRemove = (step: JourneyStep, type: MediaType) => {
    Alert.alert(`Remove this ${type}?`, 'This attachment will be removed from the step.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => removeMedia(journey.id, step.id, type) }]);
  };
  const finish = () => {
    if (journey.steps.some((step) => !step.isDone)) Alert.alert("Some steps aren't ticked yet", 'Complete this journey anyway?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Complete', onPress: async () => { await completeJourney(journey.id); router.back(); } }]);
    else completeJourney(journey.id).then(() => router.back());
  };

  return (
    <Screen>
      <Header title={journey.title} eyebrow={journey.status === 'active' ? 'IN PROGRESS' : 'JOURNEY'} />
      {journey.status === 'active' ? <View style={styles.progressGroup}><Text style={[uiStyles.body, { color: colors.textMuted }]}>Step {Math.min(currentIndex + 1 || journey.steps.length, journey.steps.length)} of {journey.steps.length}</Text><ProgressBar current={journey.steps.filter((step) => step.isDone).length} total={journey.steps.length} /></View> : null}
      <View style={styles.steps}>{journey.steps.map((step, index) => <StepCard key={step.id} step={step} index={index} current={index === currentIndex} onToggle={() => toggleStep(journey.id, step.id)} onVisual={() => addVisual(step)} onVoice={(media) => addVoice(step, media)} onNote={() => setNoteStepId(step.id)} onRemove={(type) => confirmRemove(step, type)} colors={colors} />)}</View>
      <Button label="Complete Journey" onPress={finish} icon="check-circle" />
      <NoteEditor colors={colors} visible={Boolean(noteStepId)} onCancel={() => setNoteStepId(null)} onSave={(text) => { const step = journey.steps.find((item) => item.id === noteStepId); if (step) void addNote(step, text); setNoteStepId(null); }} />
    </Screen>
  );
}

function StepCard({ step, index, current, onToggle, onVisual, onVoice, onNote, onRemove, colors }: { step: JourneyStep; index: number; current: boolean; onToggle: () => void; onVisual: () => void; onVoice: (media: Media) => void | Promise<void>; onNote: () => void; onRemove: (type: MediaType) => void; colors: ReturnType<typeof useApp>['colors'] }) {
  const visual = step.media.some((item) => item.type === 'photo' || item.type === 'video');
  const voice = step.media.some((item) => item.type === 'voice');
  const note = step.media.some((item) => item.type === 'note');
  if (step.isDone) {
    return <View style={[styles.completed, { borderColor: colors.divider }]}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: true }} accessibilityLabel={`Mark step ${index + 1} not done`} onPress={onToggle} style={styles.completedTitle}><Feather name="check-circle" size={22} color={colors.success} /><Text style={[uiStyles.cardTitle, styles.struck, { color: colors.textMuted }]}>{step.title}</Text></Pressable><StepMediaPreviews colors={colors} media={step.media} stepLabel={`step ${index + 1}`} onRemove={onRemove} /></View>;
  }
  return <View style={[styles.stepCard, { backgroundColor: current ? colors.primaryLight : colors.surface, borderColor: current ? colors.primary : colors.divider }]}><View style={styles.stepTop}><Text style={[styles.stepNumber, { color: colors.primary }]}>{index + 1}</Text><Text style={[uiStyles.cardTitle, { color: colors.text, flex: 1 }]}>{step.title}</Text><Pressable accessibilityRole="checkbox" accessibilityLabel={`Mark step ${index + 1} done`} accessibilityState={{ checked: false }} onPress={onToggle} hitSlop={8}><Feather name="circle" size={25} color={colors.primary} /></Pressable></View><StepMediaPreviews colors={colors} media={step.media} stepLabel={`step ${index + 1}`} onRemove={onRemove} />{current ? <View style={styles.mediaActions}>{!visual ? <Pressable accessibilityRole="button" accessibilityLabel={`Add photo or video to step ${index + 1}`} onPress={onVisual} style={[styles.mediaButton, { borderColor: colors.primary }]}><Feather name="image" size={17} color={colors.primary} /><Text style={[styles.mediaText, { color: colors.primary }]}>Photo/video</Text></Pressable> : null}{!voice ? <VoiceRecorderButton colors={colors} onRecorded={onVoice} /> : null}{!note ? <Pressable accessibilityRole="button" accessibilityLabel={`Add note to step ${index + 1}`} onPress={onNote} style={[styles.mediaButton, { borderColor: colors.primary }]}><Feather name="edit-3" size={17} color={colors.primary} /><Text style={[styles.mediaText, { color: colors.primary }]}>Note</Text></Pressable> : null}<Text style={[styles.mediaHint, { color: colors.textMuted }]}>One visual, one voice note and one written note</Text></View> : <Text style={[styles.mediaHint, { color: colors.textMuted }]}>Upcoming step</Text>}</View>;
}

const styles = StyleSheet.create({
  progressGroup: { gap: 8 },
  steps: { gap: 12 },
  stepCard: { borderRadius: 13, borderWidth: 1, padding: 15, gap: 13 },
  stepTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNumber: { fontSize: 16, fontWeight: '800', width: 25, height: 25, borderRadius: 13, textAlign: 'center', paddingTop: 2, backgroundColor: '#FFFFFF' },
  completed: { borderBottomWidth: 1, paddingHorizontal: 4, paddingVertical: 12, gap: 10 },
  completedTitle: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 10 },
  struck: { textDecorationLine: 'line-through' },
  mediaActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  mediaButton: { minHeight: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6 },
  mediaText: { fontSize: 14, fontWeight: '700' },
  mediaHint: { fontSize: 14, lineHeight: 20 },
});