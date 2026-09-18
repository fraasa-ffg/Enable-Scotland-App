import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp, JourneyStep, Media, MediaType } from '@/context/AppContext';
import { Button, Header, Screen, TextField, uiStyles } from '@/components/UI';
import { NoteEditor, StepMediaPreviews, VoiceRecorderButton } from '@/components/StepMedia';

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
type DraftStep = JourneyStep & { media: Media[] };

export default function CreateJourneyScreen() {
  const router = useRouter();
  const { colors, createJourney } = useApp();
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [steps, setSteps] = useState<DraftStep[]>([{ id: makeId(), title: '', isDone: false, media: [] }]);
  const [noteStepId, setNoteStepId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photos permission needed', "We can't access your photos. You can still save this journey without a journey photo.", [{ text: 'OK' }]);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]?.uri) setImageUri(result.assets[0].uri);
  };

  const chooseStepVisual = async (stepId: string) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photos permission needed', "We can't access your photos and videos. You can still add a voice note or written note instead.", [{ text: 'OK' }]);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.8 });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset?.uri) return;
    const type: MediaType = asset.type === 'video' ? 'video' : 'photo';
    updateStepMedia(stepId, { type, uri: asset.uri });
  };

  const updateStep = (id: string, value: string) => setSteps((current) => current.map((step) => step.id === id ? { ...step, title: value } : step));
  const updateStepMedia = (stepId: string, media: Media) => setSteps((current) => current.map((step) => {
    if (step.id !== stepId) return step;
    const slot = media.type === 'photo' || media.type === 'video' ? ['photo', 'video'] : [media.type];
    return { ...step, media: [...step.media.filter((item) => !slot.includes(item.type)), media] };
  }));
  const removeStepMedia = (stepId: string, type: MediaType) => {
    Alert.alert(`Remove this ${type}?`, 'This attachment will be removed from the step.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setSteps((current) => current.map((step) => step.id === stepId ? { ...step, media: step.media.filter((item) => item.type !== type) } : step)) },
    ]);
  };
  const addStep = () => setSteps((current) => [...current, { id: makeId(), title: '', isDone: false, media: [] }]);
  const removeStep = (id: string) => setSteps((current) => current.filter((step) => step.id !== id));
  const save = async () => {
    const validSteps = steps.filter((step) => step.title.trim());
    if (!validSteps.length) { Alert.alert('Add a step first', 'Add at least one step to save your journey.'); return; }
    setSaving(true);
    try {
      const journey = await createJourney({ title: title.trim(), imageUri, steps: validSteps.map((step) => ({ ...step, title: step.title.trim() })) });
      router.replace({ pathname: '/journey/[id]', params: { id: journey.id } });
    } catch {
      Alert.alert('Journey not saved', 'We could not save the attached media. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header title="New journey" eyebrow={`STEP ${page} OF 3`} />
      {page === 1 ? <View style={styles.panel}><Text style={[uiStyles.sectionTitle, { color: colors.primaryDark }]}>Name your journey</Text><Text style={[uiStyles.body, { color: colors.textMuted }]}>A short name helps you recognise it later.</Text><TextField label="Journey name" value={title} onChangeText={setTitle} placeholder="e.g. Trip to Edinburgh" /><Button label="Next" onPress={() => setPage(2)} disabled={!title.trim()} icon="arrow-right" /></View> : null}
      {page === 2 ? <View style={styles.panel}><Text style={[uiStyles.sectionTitle, { color: colors.primaryDark }]}>Add a journey photo</Text><Text style={[uiStyles.body, { color: colors.textMuted }]}>A photo can make the journey easier to recognise. You can skip this for now.</Text>{imageUri ? <View style={styles.photoWrap}><Image source={{ uri: imageUri }} style={styles.photo} /><Pressable accessibilityRole="button" accessibilityLabel="Remove photo" onPress={() => setImageUri('')} style={styles.photoRemove}><Feather name="x" size={19} color={colors.onDanger} /></Pressable></View> : <View style={[styles.placeholder, { backgroundColor: colors.primaryLight }]}><Feather name="image" size={34} color={colors.primary} /><Text style={[uiStyles.body, { color: colors.primaryDark }]}>No photo yet</Text></View>}<Button label={imageUri ? 'Change photo' : 'Choose from library'} onPress={choosePhoto} variant="secondary" icon="image" /><Pressable accessibilityRole="button" accessibilityLabel="Skip for now" onPress={() => setPage(3)}><Text style={[styles.link, { color: colors.primary }]}>Skip for now</Text></Pressable><Button label="Next" onPress={() => setPage(3)} icon="arrow-right" /></View> : null}
      {page === 3 ? <View style={styles.panel}><Text style={[uiStyles.sectionTitle, { color: colors.primaryDark }]}>Add your steps</Text><Text style={[uiStyles.body, { color: colors.textMuted }]}>Write the steps in the order you want to follow them. Each step can have one photo or video, one voice note and one written note.</Text><View style={styles.steps}>{steps.map((step, index) => {
        const visual = step.media.some((item) => item.type === 'photo' || item.type === 'video');
        const voice = step.media.some((item) => item.type === 'voice');
        const note = step.media.some((item) => item.type === 'note');
        return <View key={step.id} style={[styles.stepRow, { backgroundColor: colors.surface, borderColor: colors.divider }]}><Text style={[styles.number, { color: colors.primary }]}>{index + 1}</Text><View style={styles.stepField}><TextField label={`Step ${index + 1}`} value={step.title} onChangeText={(value) => updateStep(step.id, value)} placeholder="e.g. Walk to the bus stop" /><StepMediaPreviews colors={colors} media={step.media} stepLabel={`step ${index + 1}`} onRemove={(type) => removeStepMedia(step.id, type)} /><View style={styles.mediaActions}>{!visual ? <Pressable accessibilityRole="button" accessibilityLabel={`Add photo or video to step ${index + 1}`} onPress={() => chooseStepVisual(step.id)} style={[styles.mediaButton, { borderColor: colors.primary }]}><Feather name="image" size={17} color={colors.primary} /><Text style={[styles.mediaText, { color: colors.primary }]}>Photo/video</Text></Pressable> : null}{!voice ? <VoiceRecorderButton colors={colors} onRecorded={(media) => updateStepMedia(step.id, media)} /> : null}{!note ? <Pressable accessibilityRole="button" accessibilityLabel={`Add note to step ${index + 1}`} onPress={() => setNoteStepId(step.id)} style={[styles.mediaButton, { borderColor: colors.primary }]}><Feather name="edit-3" size={17} color={colors.primary} /><Text style={[styles.mediaText, { color: colors.primary }]}>Note</Text></Pressable> : null}</View></View><Pressable accessibilityRole="button" accessibilityLabel={`Delete step ${index + 1}`} onPress={() => removeStep(step.id)} hitSlop={8}><Feather name="trash-2" size={20} color={colors.danger} /></Pressable></View>;
      })}</View><Button label="Add another step" onPress={addStep} variant="secondary" icon="plus" /><Text style={[styles.saveHint, { color: colors.textMuted }]}>At least one titled step is needed to save your journey.</Text><Button label={saving ? 'Saving…' : 'Save journey'} onPress={save} disabled={saving || !steps.some((step) => step.title.trim())} icon="check" /><Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => setPage(2)}><Text style={[styles.link, { color: colors.primary }]}>Back to photo</Text></Pressable></View> : null}
      <NoteEditor colors={colors} visible={Boolean(noteStepId)} onCancel={() => setNoteStepId(null)} onSave={(text) => { if (noteStepId) updateStepMedia(noteStepId, { type: 'note', noteText: text }); setNoteStepId(null); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 15 },
  photoWrap: { position: 'relative' },
  photo: { width: '100%', height: 190, borderRadius: 14 },
  photoRemove: { position: 'absolute', top: 10, right: 10, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B3261E' },
  placeholder: { height: 190, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
  link: { fontSize: 16, fontWeight: '700', textAlign: 'center', padding: 8 },
  steps: { gap: 12 },
  stepRow: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  number: { fontSize: 18, fontWeight: '800', width: 22, textAlign: 'center', paddingTop: 14 },
  stepField: { flex: 1, gap: 9 },
  mediaActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  mediaButton: { minHeight: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6 },
  mediaText: { fontSize: 14, fontWeight: '700' },
  saveHint: { fontSize: 14, lineHeight: 20 },
});