import React, { PropsWithChildren } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  const content = <View style={[styles.content, { paddingBottom: insets.bottom + 108 }]}>{children}</View>;
  return scroll ? <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={content.props.style} keyboardShouldPersistTaps="handled">{children}</ScrollView> : <View style={[styles.screen, { backgroundColor: colors.background }]}>{content}</View>;
}

export function Header({ title, eyebrow }: { title: string; eyebrow?: string }) {
  const { colors } = useApp();
  return (
    <View style={styles.header}>
      <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
        <Feather name="navigation" size={17} color={colors.onPrimary} />
      </View>
      <View style={styles.headerText}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow}</Text> : null}
        <Text style={[styles.title, { color: colors.primaryDark }]}>{title}</Text>
      </View>
    </View>
  );
}

export function Button({ label, onPress, variant = 'primary', disabled = false, icon }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; disabled?: boolean; icon?: keyof typeof Feather.glyphMap }) {
  const { colors } = useApp();
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : variant === 'secondary' ? colors.primaryLight : 'transparent';
  const fg = variant === 'primary' ? colors.onPrimary : variant === 'danger' ? colors.onDanger : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: bg, borderColor: variant === 'ghost' ? colors.primary : bg, opacity: disabled ? 0.45 : pressed ? 0.78 : 1 }]}
    >
      {icon ? <Feather name={icon} size={18} color={fg} /> : null}
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function TextField({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: 'default' | 'phone-pad'; multiline?: boolean }) {
  const { colors } = useApp();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }, multiline && styles.multiline]}
      />
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { colors } = useApp();
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: colors.primaryDark }]}>{title}</Text>
      {action && onAction ? <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={onAction}><Text style={[styles.link, { color: colors.primary }]}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function EmptyState({ title, body, action, onAction }: { title: string; body: string; action?: string; onAction?: () => void }) {
  const { colors } = useApp();
  return (
    <View style={[styles.empty, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
      <Feather name="compass" size={26} color={colors.primary} />
      <Text style={[styles.cardTitle, { color: colors.primaryDark }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.text }]}>{body}</Text>
      {action && onAction ? <Button label={action} onPress={onAction} variant="secondary" icon="plus" /> : null}
    </View>
  );
}

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const { colors } = useApp();
  const width = `${total ? Math.round((current / total) * 100) : 0}%` as `${number}%`;
  return <View accessibilityRole="progressbar" accessibilityLabel="Journey progress" accessibilityValue={{ text: `Step ${current} of ${total}` }} style={[styles.progressTrack, { backgroundColor: colors.accentLight }]}><View style={[styles.progressFill, { backgroundColor: colors.accent, width }]} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 18, gap: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 4 },
  logoMark: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 1 },
  eyebrow: { fontSize: 13, fontWeight: '700', letterSpacing: 0.6 },
  title: { fontSize: 28, lineHeight: 33, fontWeight: '700' },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  link: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24 },
  cardTitle: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  button: { minHeight: 50, paddingHorizontal: 17, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  buttonText: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontSize: 16, fontWeight: '700' },
  input: { minHeight: 52, borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 14, fontSize: 16 },
  multiline: { minHeight: 110, paddingTop: 13, textAlignVertical: 'top' },
  empty: { borderRadius: 14, borderWidth: 1, padding: 18, gap: 10 },
  progressTrack: { height: 10, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 8 },
});

export const uiStyles = styles;