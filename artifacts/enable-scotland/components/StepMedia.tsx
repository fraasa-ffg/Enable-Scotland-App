import { Feather } from '@expo/vector-icons';
import { RecordingPresets, requestRecordingPermissionsAsync, useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppColors } from '@/constants/colors';
import { Media, MediaType } from '@/context/AppContext';

type MediaProps = {
  colors: AppColors;
  media: Media[];
  onRemove: (type: MediaType) => void;
  stepLabel: string;
};

export function StepMediaPreviews({ colors, media, onRemove, stepLabel }: MediaProps) {
  return (
    <View style={styles.previews}>
      {media.map((item) => (
        <MediaPreview key={item.type} colors={colors} media={item} onRemove={onRemove} stepLabel={stepLabel} />
      ))}
    </View>
  );
}

function MediaPreview({ colors, media, onRemove, stepLabel }: Omit<MediaProps, 'media'> & { media: Media }) {
  if (media.type === 'photo' && media.uri) {
    return (
      <View style={styles.previewRow}>
        <Image accessibilityLabel={`Photo for ${stepLabel}`} source={{ uri: media.uri }} style={styles.imagePreview} />
        <Pressable accessibilityRole="button" accessibilityLabel={`Remove photo from ${stepLabel}`} onPress={() => onRemove('photo')} hitSlop={8}>
          <Feather name="x-circle" size={22} color={colors.danger} />
        </Pressable>
      </View>
    );
  }
  if (media.type === 'video' && media.uri) {
    return <VideoPreview colors={colors} media={media} onRemove={onRemove} stepLabel={stepLabel} />;
  }
  if (media.type === 'voice' && media.uri) {
    return <VoicePreview colors={colors} media={media} onRemove={onRemove} stepLabel={stepLabel} />;
  }
  if (media.type === 'note') {
    return (
      <View style={[styles.notePreview, { backgroundColor: colors.accentLight }]}>
        <Feather name="edit-3" size={17} color={colors.accent} />
        <Text style={[styles.noteText, { color: colors.text }]}>{media.noteText}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Remove note from ${stepLabel}`} onPress={() => onRemove('note')} hitSlop={8}>
          <Feather name="x-circle" size={22} color={colors.danger} />
        </Pressable>
      </View>
    );
  }
  return null;
}

function VideoPreview({ colors, media, onRemove, stepLabel }: Omit<MediaProps, 'media'> & { media: Media }) {
  const player = useVideoPlayer(media.uri ?? '', (videoPlayer) => {
    videoPlayer.pause();
  });
  return (
    <View style={styles.previewRow}>
      <VideoView accessibilityLabel={`Video for ${stepLabel}`} player={player} style={styles.videoPreview} contentFit="cover" nativeControls />
      <Pressable accessibilityRole="button" accessibilityLabel={`Remove video from ${stepLabel}`} onPress={() => onRemove('video')} hitSlop={8}>
        <Feather name="x-circle" size={22} color={colors.danger} />
      </Pressable>
    </View>
  );
}

function VoicePreview({ colors, media, onRemove, stepLabel }: Omit<MediaProps, 'media'> & { media: Media }) {
  const player = useAudioPlayer(media.uri ?? '');
  const status = useAudioPlayerStatus(player);
  const duration = media.durationMs ? formatDuration(media.durationMs) : 'Voice note';
  return (
    <View style={[styles.voicePreview, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${status.playing ? 'Pause' : 'Play'} voice note for ${stepLabel}`} onPress={() => status.playing ? player.pause() : player.play()} style={[styles.playButton, { backgroundColor: colors.primaryLight }]}>
        <Feather name={status.playing ? 'pause' : 'play'} size={17} color={colors.primary} />
      </Pressable>
      <Text style={[styles.voiceText, { color: colors.text }]}>{duration}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Remove voice note from ${stepLabel}`} onPress={() => onRemove('voice')} hitSlop={8}>
        <Feather name="x-circle" size={22} color={colors.danger} />
      </Pressable>
    </View>
  );
}

export function VoiceRecorderButton({ colors, onRecorded }: { colors: AppColors; onRecorded: (media: Media) => void | Promise<void> }) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [busy, setBusy] = useState(false);
  const recording = recorderState.isRecording;

  const toggleRecording = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (recording) {
        const durationMs = Math.round(recorder.currentTime * 1000);
        await recorder.stop();
        if (recorder.uri) await onRecorded({ type: 'voice', uri: recorder.uri, durationMs });
        return;
      }
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Microphone permission needed', "We can't access your microphone. You can still add a written note instead.", [{ text: 'OK' }]);
        return;
      }
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert('Voice note unavailable', 'We could not record a voice note. You can still add a written note instead.', [{ text: 'OK' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={recording ? 'Stop voice recording' : 'Record voice note'} onPress={toggleRecording} style={({ pressed }) => [styles.mediaButton, { borderColor: recording ? colors.danger : colors.primary, opacity: busy ? 0.5 : pressed ? 0.75 : 1 }]}>
      <Feather name={recording ? 'square' : 'mic'} size={17} color={recording ? colors.danger : colors.primary} />
      <Text style={[styles.mediaText, { color: recording ? colors.danger : colors.primary }]}>{recording ? 'Stop recording' : 'Voice note'}</Text>
    </Pressable>
  );
}

export function NoteEditor({ colors, visible, onCancel, onSave }: { colors: AppColors; visible: boolean; onCancel: () => void; onSave: (text: string) => void }) {
  const [text, setText] = useState('');
  const close = () => {
    setText('');
    onCancel();
  };
  const save = () => {
    if (!text.trim()) return;
    onSave(text.trim());
    setText('');
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.primaryDark }]}>Add note</Text>
          <Text style={[styles.modalHint, { color: colors.textMuted }]}>Write a short note for this step.</Text>
          <TextInput
            autoFocus
            accessibilityLabel="Step note"
            value={text}
            onChangeText={setText}
            placeholder="e.g. Ask for help at the information desk"
            placeholderTextColor={colors.textMuted}
            multiline
            style={[styles.noteInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          />
          <View style={styles.modalActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Cancel note" onPress={close} style={[styles.modalButton, { borderColor: colors.primary }]}>
              <Text style={[styles.modalButtonText, { color: colors.primary }]}>Cancel</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Save note" onPress={save} disabled={!text.trim()} style={[styles.modalButton, { backgroundColor: colors.primary, borderColor: colors.primary, opacity: text.trim() ? 1 : 0.45 }]}>
              <Text style={[styles.modalButtonText, { color: colors.onPrimary }]}>Save note</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  previews: { gap: 9 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  imagePreview: { width: 100, height: 74, borderRadius: 10 },
  videoPreview: { width: 150, height: 84, borderRadius: 10, overflow: 'hidden' },
  notePreview: { borderRadius: 9, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  noteText: { flex: 1, fontSize: 15, lineHeight: 21 },
  voicePreview: { borderWidth: 1, borderRadius: 10, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  playButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  voiceText: { flex: 1, fontSize: 15, fontWeight: '700' },
  mediaButton: { minHeight: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6 },
  mediaText: { fontSize: 14, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 22 },
  modalCard: { borderRadius: 16, padding: 18, gap: 12 },
  modalTitle: { fontSize: 21, fontWeight: '800' },
  modalHint: { fontSize: 15, lineHeight: 21 },
  noteInput: { minHeight: 110, borderWidth: 1, borderRadius: 10, padding: 12, textAlignVertical: 'top', fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalButton: { minHeight: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  modalButtonText: { fontSize: 15, fontWeight: '700' },
});