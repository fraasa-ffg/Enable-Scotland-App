import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { AppColors, ThemeKey, themes } from '@/constants/colors';
import { mediaUris, persistMedia, removePersistedMediaUri } from '@/utils/media';

export type JourneyStatus = 'saved' | 'active' | 'completed';
export type MediaType = 'photo' | 'video' | 'voice' | 'note';
export type Media = { type: MediaType; uri?: string; noteText?: string; durationMs?: number };
export type JourneyStep = { id: string; title: string; isDone: boolean; media: Media[] };
export type Journey = {
  id: string;
  title: string;
  imageUri?: string;
  status: JourneyStatus;
  startCount: number;
  lastStartedAt?: string;
  createdAt: string;
  steps: JourneyStep[];
};
export type Contact = { id: string; name: string; phone: string; relationship?: string };
export type ChecklistItem = { id: string; label: string };

type AppState = {
  journeys: Journey[];
  contacts: Contact[];
  checklist: ChecklistItem[];
  themeKey: ThemeKey;
};

type AppContextValue = AppState & {
  hydrated: boolean;
  colors: AppColors;
  createJourney: (journey: Omit<Journey, 'id' | 'createdAt' | 'status' | 'startCount'>) => Promise<Journey>;
  deleteJourney: (id: string) => Promise<void>;
  startJourney: (id: string) => Promise<void>;
  toggleStep: (journeyId: string, stepId: string) => Promise<void>;
  addMedia: (journeyId: string, stepId: string, media: Media) => Promise<void>;
  removeMedia: (journeyId: string, stepId: string, type: MediaType) => Promise<void>;
  completeJourney: (id: string) => Promise<void>;
  addContact: (contact: Omit<Contact, 'id'>) => Promise<boolean>;
  deleteContact: (id: string) => Promise<void>;
  updateChecklist: (id: string, label: string) => Promise<void>;
  addChecklistItem: () => Promise<string>;
  removeChecklistItem: (id: string) => Promise<void>;
  setTheme: (theme: ThemeKey) => Promise<void>;
};

const STORAGE_KEY = '@enable-scotland/state-v1';
const defaultChecklist: ChecklistItem[] = [
  { id: 'keys', label: 'Keys' },
  { id: 'travel-card', label: 'Ticket or travel card' },
  { id: 'phone', label: 'Phone charged' },
  { id: 'coat', label: 'Umbrella or coat' },
  { id: 'support-card', label: 'Support contact card' },
];

const emptyState: AppState = { journeys: [], contacts: [], checklist: defaultChecklist, themeKey: 'enable' };

const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...emptyState, ...JSON.parse(raw) });
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [state, hydrated]);

  const commit = async (next: AppState) => {
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo<AppContextValue>(() => ({
    ...state,
    hydrated,
    colors: themes[state.themeKey],
    createJourney: async (draft) => {
      const steps = await Promise.all(draft.steps.map(async (step) => ({
        ...step,
        media: await Promise.all(step.media.map((media) => persistMedia(media))),
      })));
      const journey: Journey = {
        ...draft,
        imageUri: draft.imageUri ? (await persistMedia({ type: 'photo', uri: draft.imageUri })).uri : draft.imageUri,
        steps,
        id: id(),
        createdAt: now(),
        status: 'saved',
        startCount: 0,
      };
      await commit({ ...state, journeys: [journey, ...state.journeys] });
      AccessibilityInfo.announceForAccessibility('Journey saved');
      return journey;
    },
    deleteJourney: async (journeyId) => {
      const journey = state.journeys.find((item) => item.id === journeyId);
      if (journey) {
        await Promise.all([...new Set(mediaUris(journey))].map((uri) => removePersistedMediaUri(uri)));
      }
      await commit({ ...state, journeys: state.journeys.filter((item) => item.id !== journeyId) });
      if (journey) AccessibilityInfo.announceForAccessibility(`${journey.title} deleted`);
    },
    startJourney: async (journeyId) => {
      const startedAt = now();
      await commit({
        ...state,
        journeys: state.journeys.map((journey) => {
          if (journey.id === journeyId) {
            return {
              ...journey,
              status: 'active',
              startCount: journey.startCount + 1,
              lastStartedAt: startedAt,
              steps: journey.status === 'completed'
                ? journey.steps.map((step) => ({ ...step, isDone: false }))
                : journey.steps,
            };
          }
          return journey.status === 'active' ? { ...journey, status: 'saved' } : journey;
        }),
      });
    },
    toggleStep: async (journeyId, stepId) => {
      const journey = state.journeys.find((item) => item.id === journeyId);
      const step = journey?.steps.find((item) => item.id === stepId);
      if (!journey || !step) return;
      const nextDone = !step.isDone;
      await commit({
        ...state,
        journeys: state.journeys.map((item) => item.id !== journeyId ? item : {
          ...item,
          steps: item.steps.map((entry) => entry.id === stepId ? { ...entry, isDone: nextDone } : entry),
        }),
      });
      AccessibilityInfo.announceForAccessibility(nextDone ? `Step complete: ${step.title}` : `Step reopened: ${step.title}`);
    },
    addMedia: async (journeyId, stepId, media) => {
      const persistedMedia = await persistMedia(media);
      const journey = state.journeys.find((item) => item.id === journeyId);
      const step = journey?.steps.find((item) => item.id === stepId);
      const slot = media.type === 'photo' || media.type === 'video' ? ['photo', 'video'] : [media.type];
      const replacedUris = step?.media.filter((item) => slot.includes(item.type)).map((item) => item.uri).filter((uri): uri is string => Boolean(uri)) ?? [];
      await commit({
        ...state,
        journeys: state.journeys.map((journey) => journey.id !== journeyId ? journey : {
          ...journey,
          steps: journey.steps.map((step) => {
            if (step.id !== stepId) return step;
            return { ...step, media: [...step.media.filter((item) => !slot.includes(item.type)), persistedMedia] };
          }),
        }),
      });
      await Promise.all(replacedUris.map((uri) => removePersistedMediaUri(uri)));
    },
    removeMedia: async (journeyId, stepId, type) => {
      const journey = state.journeys.find((item) => item.id === journeyId);
      const removedUris = journey?.steps.find((item) => item.id === stepId)?.media
        .filter((item) => item.type === type).map((item) => item.uri)
        .filter((uri): uri is string => Boolean(uri)) ?? [];
      await commit({
        ...state,
        journeys: state.journeys.map((journey) => journey.id !== journeyId ? journey : {
          ...journey,
          steps: journey.steps.map((step) => step.id !== stepId ? step : { ...step, media: step.media.filter((item) => item.type !== type) }),
        }),
      });
      await Promise.all(removedUris.map((uri) => removePersistedMediaUri(uri)));
    },
    completeJourney: async (journeyId) => {
      await commit({
        ...state,
        journeys: state.journeys.map((journey) => journey.id === journeyId ? { ...journey, status: 'completed' } : journey),
      });
      AccessibilityInfo.announceForAccessibility('Journey complete');
    },
    addContact: async (contact) => {
      const phone = contact.phone.replace(/[^\d+]/g, '');
      if (state.contacts.length >= 3 || state.contacts.some((item) => item.phone === phone)) return false;
      await commit({ ...state, contacts: [...state.contacts, { ...contact, phone, id: id() }] });
      AccessibilityInfo.announceForAccessibility(`${contact.name} added`);
      return true;
    },
    deleteContact: async (contactId) => {
      const contact = state.contacts.find((item) => item.id === contactId);
      await commit({ ...state, contacts: state.contacts.filter((item) => item.id !== contactId) });
      if (contact) AccessibilityInfo.announceForAccessibility(`${contact.name} deleted`);
    },
    updateChecklist: async (itemId, label) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      await commit({ ...state, checklist: state.checklist.map((item) => item.id === itemId ? { ...item, label: trimmed } : item) });
    },
    addChecklistItem: async () => {
      const newId = id();
      await commit({ ...state, checklist: [...state.checklist, { id: newId, label: 'New item' }] });
      return newId;
    },
    removeChecklistItem: async (itemId) => {
      await commit({ ...state, checklist: state.checklist.filter((item) => item.id !== itemId) });
    },
    setTheme: async (themeKey) => {
      await commit({ ...state, themeKey });
    },
  }), [state, hydrated]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}