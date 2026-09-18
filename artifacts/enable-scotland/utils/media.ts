import * as FileSystem from 'expo-file-system/legacy';
import type { Media } from '@/context/AppContext';

const MEDIA_DIRECTORY = `${FileSystem.documentDirectory ?? ''}enable-scotland-media/`;

function extensionFor(uri: string, type: Media['type']) {
  const path = uri.split(/[?#]/)[0];
  const extension = path.split('.').pop()?.toLowerCase();
  if (extension && extension.length <= 5 && /^[a-z0-9]+$/.test(extension)) return extension;
  if (type === 'video') return 'mp4';
  if (type === 'voice') return 'm4a';
  return 'jpg';
}

export async function persistMedia(media: Media): Promise<Media> {
  if (!media.uri || !FileSystem.documentDirectory || media.uri.startsWith(MEDIA_DIRECTORY)) return media;
  await FileSystem.makeDirectoryAsync(MEDIA_DIRECTORY, { intermediates: true });
  const destination = `${MEDIA_DIRECTORY}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${extensionFor(media.uri, media.type)}`;
  await FileSystem.copyAsync({ from: media.uri, to: destination });
  return { ...media, uri: destination };
}

export async function removePersistedMediaUri(uri?: string) {
  if (!uri || !FileSystem.documentDirectory || !uri.startsWith(MEDIA_DIRECTORY)) return;
  await FileSystem.deleteAsync(uri, { idempotent: true });
}

export function mediaUris(journey: { imageUri?: string; steps: { media: Media[] }[] }) {
  return [
    journey.imageUri,
    ...journey.steps.flatMap((step) => step.media.map((media) => media.uri)),
  ].filter((uri): uri is string => Boolean(uri));
}