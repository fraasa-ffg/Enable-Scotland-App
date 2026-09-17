import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/context/AppContext';
import { Header, Screen, uiStyles } from '@/components/UI';

const faqs = [
  ['What do I do if my transport is delayed?', 'Find a member of staff, driver or conductor and show them your journey plan. You can also call an emergency contact from the SOS screen.'],
  ['How do I add an emergency contact?', 'Open SOS, choose Add contact, then enter their name and phone number. You can save up to three contacts.'],
  ['How does SOS work?', 'SOS opens your messages app with a help message for all your emergency contacts. It adds your location when your phone can find it. You press Send in the messages app.'],
  ['Can I use the app offline?', 'Yes. Your journeys, checklist, contacts and settings stay on your phone. SOS and calls need mobile signal.'],
  ['How do I add photos, videos and voice notes?', 'Open the current step in a journey and use its media buttons. Each step can have one visual, one voice note and one written note.'],
  ['How do I change the colour theme?', 'Open Settings and choose a theme swatch. The app changes straight away.'],
  ['How can I have text read aloud?', 'Turn on VoiceOver on iPhone or TalkBack on Android in your phone’s accessibility settings.'],
];

export default function HelpScreen() {
  const { colors } = useApp();
  const [open, setOpen] = useState<number | null>(null);
  const openWebsite = async () => {
    const supported = await Linking.canOpenURL('https://www.enable.org.uk');
    if (supported) await Linking.openURL('https://www.enable.org.uk');
    else Alert.alert("We couldn't open the website.", 'Please check your internet connection and try again.');
  };
  return <Screen><Header title="Help" eyebrow="SUPPORT" /><View style={[styles.intro, { backgroundColor: colors.supportLight }]}><Text style={[uiStyles.body, { color: colors.support }]}>Simple answers for using Enable Scotland on your journey.</Text></View><Text style={[uiStyles.sectionTitle, { color: colors.primaryDark }]}>FAQ</Text>{faqs.map(([question, answer], index) => <View key={question} style={[styles.faq, { borderColor: colors.divider, backgroundColor: colors.surface }]}><Pressable accessibilityRole="button" accessibilityLabel={question} accessibilityState={{ expanded: open === index }} onPress={() => setOpen(open === index ? null : index)} style={styles.faqQuestion}><Text style={[uiStyles.cardTitle, { color: colors.text, flex: 1 }]}>{question}</Text><Text style={[styles.chevron, { color: colors.primary }]}>{open === index ? '−' : '+'}</Text></Pressable>{open === index ? <Text style={[uiStyles.body, { color: colors.textMuted }]}>{answer}</Text> : null}</View>)}<Pressable accessibilityRole="link" accessibilityLabel="Visit Enable Scotland website" onPress={openWebsite} style={[styles.website, { backgroundColor: colors.primary }]}><Text style={[uiStyles.cardTitle, { color: colors.onPrimary }]}>Visit Enable Scotland website</Text><Text style={[uiStyles.body, { color: colors.onPrimary }]}>enable.org.uk</Text></Pressable></Screen>;
}

const styles = StyleSheet.create({
  intro: { borderRadius: 14, padding: 16 },
  faq: { borderWidth: 1, borderRadius: 11, padding: 15, gap: 10 },
  faqQuestion: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chevron: { fontSize: 26, lineHeight: 26, fontWeight: '400' },
  website: { borderRadius: 14, padding: 17, gap: 4 },
});