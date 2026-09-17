import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp, JourneyStep, Media } from '@/context/AppContext';
import { Button, Header, Screen, TextField, uiStyles } from '@/components/UI';

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
type DraftStep = JourneyStep & { media: Media[] };

export default function CreateJourneyScreen() {
  const router = useRouter();
  const { colors, createJourney } = useApp();
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [steps, setSteps] = useState<DraftStep[]>([{ id: makeId(), title: '', isDone: false, media: [] }]);
  const [saving, setSaving] = useState(false);
  const choosePhoto = async () => { const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 }); if (!result.canceled && result.assets[0]?.uri) setImageUri(result.assets[0].uri); };
  const updateStep = (id: string, value: string) => setSteps((current) => current.map((step) => step.id === id ? { ...step, title: value } : step));
  const addStep = () => setSteps((current) => [...current, { id: makeId(), title: '', isDone: false, media: [] }]);
  const removeStep = (id: string) => setSteps((current) => current.filter((step) => step.id !== id));
  const save = async () => {
    const validSteps = steps.filter((step) => step.title.trim());
    if (!validSteps.length) { Alert.alert('Add a step first', 'Add at least one step to save your journey.'); return; }
    setSaving(true);
    const journey = await createJourney({ title: title.trim(), imageUri, steps: validSteps.map((step) => ({ ...step, title: step.title.trim() })) });
    setSaving(false);
    router.replace({ pathname: '/journey/[id]', params: { id: journey.id } });
  };
  return <Screen><Header title="New journey" eyebrow={`STEP ${page} OF 3`} />{page === 1 ? <View style={styles.panel}><Text style={[uiStyles.sectionTitle, { color: colors.primaryDark }]}>Name your journey</Text><Text style={[uiStyles.body, { color: colors.textMuted }]}>A short name helps you recognise it later.</Text><TextField label="Journey name" value={title} onChangeText={setTitle} placeholder="e.g. Trip to Edinburgh" /><Button label="Next" onPress={() => setPage(2)} disabled={!title.trim()} icon="arrow-right" /></View> : null}{page === 2 ? <View style={styles.panel}><Text style={[uiStyles.sectionTitle, { color: colors.primaryDark }]}>Add a journey photo</Text><Text style={[uiStyles.body, { color: colors.textMuted }]}>A photo can make the journey easier to recognise. You can skip this for now.</Text>{imageUri ? <View style={styles.photoWrap}><Image source={{ uri: imageUri }} style={styles.photo} /><Pressable accessibilityRole="button" accessibilityLabel="Remove photo" onPress={() => setImageUri('')} style={styles.photoRemove}><Feather name="x" size={19} color={colors.onDanger} /></Pressable></View> : <View style={[styles.placeholder, { backgroundColor: colors.primaryLight }]}><Feather name="image" size={34} color={colors.primary} /><Text style={[uiStyles.body, { color: colors.primaryDark }]}>No photo yet</Text></View>}<Button label={imageUri ? 'Change photo' : 'Choose from library'} onPress={choosePhoto} variant="secondary" icon="image" /><Pressable accessibilityRole="button" accessibilityLabel="Skip for now" onPress={() => setPage(3)}><Text style={[styles.link, { color: colors.primary }]}>Skip for now</Text></Pressable><Button label="Next" onPress={() => setPage(3)} icon="arrow-right" /></View> : null}{page === 3 ? <View style={styles.panel}><Text style={[uiStyles.sectionTitle, { color: colors.primaryDark }]}>Add your steps</Text><Text style={[uiStyles.body, { color: colors.textMuted }]}>Write the steps in the order you want to follow them.</Text><View style={styles.steps}>{steps.map((step, index) => <View key={step.id} style={[styles.stepRow, { backgroundColor: colors.surface, borderColor: colors.divider }]}><Text style={[styles.number, { color: colors.primary }]}>{index + 1}</Text><View style={styles.stepField}><TextField label={`Step ${index + 1}`} value={step.title} onChangeText={(value) => updateStep(step.id, value)} placeholder="e.g. Walk to the bus stop" /></View><Pressable accessibilityRole="button" accessibilityLabel={`Delete step ${index + 1}`} onPress={() => removeStep(step.id)} hitSlop={8}><Feather name="trash-2" size={20} color={colors.danger} /></Pressable></View>)}</View><Button label="Add another step" onPress={addStep} variant="secondary" icon="plus" /><Text style={[styles.saveHint, { color: colors.textMuted }]}>At least one titled step is needed to save your journey.</Text><Button label={saving ? 'Saving…' : 'Save journey'} onPress={save} disabled={saving || !steps.some((step) => step.title.trim())} icon="check" /><Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => setPage(2)}><Text style={[styles.link, { color: colors.primary }]}>Back to photo</Text></Pressable></View> : null}</Screen>;
}

const styles = StyleSheet.create({
  panel: { gap: 15 },
  photoWrap: { position: 'relative' },
  photo: { width: '100%', height: 190, borderRadius: 14 },
  photoRemove: { position: 'absolute', top: 10, right: 10, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B3261E' },
  placeholder: { height: 190, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
  link: { fontSize: 16, fontWeight: '700', textAlign: 'center', padding: 8 },
  steps: { gap: 12 },
  stepRow: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  number: { fontSize: 18, fontWeight: '800', width: 22, textAlign: 'center' },
  stepField: { flex: 1 },
  saveHint: { fontSize: 14, lineHeight: 20 },
});