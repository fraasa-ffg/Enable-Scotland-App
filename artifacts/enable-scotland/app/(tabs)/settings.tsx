import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/context/AppContext';
import { Header, Screen, uiStyles } from '@/components/UI';
import { ThemeKey } from '@/constants/colors';

const options: { key: ThemeKey; title: string; description: string }[] = [
  { key: 'enable', title: 'Enable Standard', description: 'Deep violet with warm pink highlights' },
  { key: 'blue', title: 'Ocean Blue', description: 'Clear blue with amber highlights' },
  { key: 'teal', title: 'Highland Teal', description: 'Grounded teal with terracotta warmth' },
  { key: 'contrast', title: 'High Contrast', description: 'Strong black, white and yellow contrast' },
];

export default function SettingsScreen() {
  const { colors, themeKey, setTheme } = useApp();
  return <Screen><Header title="Settings" eyebrow="MAKE IT YOURS" /><Text style={[uiStyles.sectionTitle, { color: colors.primaryDark }]}>Colour theme</Text>{options.map((option) => <Pressable key={option.key} accessibilityRole="button" accessibilityLabel={option.title} accessibilityState={{ selected: themeKey === option.key }} onPress={() => setTheme(option.key)} style={[styles.themeCard, { backgroundColor: colors.surface, borderColor: themeKey === option.key ? colors.primary : colors.divider, borderWidth: themeKey === option.key ? 2 : 1 }]}><View style={[styles.swatch, { backgroundColor: option.key === 'contrast' ? '#000000' : option.key === 'blue' ? '#1565C0' : option.key === 'teal' ? '#00695C' : '#4C16B3' }]} /><View style={styles.themeCopy}><Text style={[uiStyles.cardTitle, { color: colors.text }]}>{option.title}</Text><Text style={[uiStyles.body, { color: colors.textMuted }]}>{option.description}</Text></View>{themeKey === option.key ? <Feather name="check-circle" size={24} color={colors.primary} /> : null}</Pressable>)}<View style={[styles.info, { backgroundColor: colors.supportLight }]}><Feather name="volume-2" size={23} color={colors.support} /><Text style={[uiStyles.body, { color: colors.support }]}>To have text read aloud, turn on VoiceOver (iPhone) or TalkBack (Android) in your phone’s accessibility settings.</Text></View><Text style={[styles.version, { color: colors.textMuted }]}>Enable Scotland · Version 1.0</Text></Screen>;
}

const styles = StyleSheet.create({
  themeCard: { borderRadius: 13, padding: 14, minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12 },
  swatch: { width: 42, height: 42, borderRadius: 12 },
  themeCopy: { flex: 1, gap: 3 },
  info: { borderRadius: 13, padding: 15, flexDirection: 'row', gap: 11, alignItems: 'flex-start' },
  version: { fontSize: 14, textAlign: 'center' },
});