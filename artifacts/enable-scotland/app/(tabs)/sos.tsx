import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/context/AppContext';
import { Button, Header, Screen, SectionTitle, uiStyles } from '@/components/UI';

export default function SosScreen() {
  const router = useRouter();
  const { colors, contacts, deleteContact } = useApp();
  const sendSos = async () => {
    if (!contacts.length) {
      Alert.alert('Add an emergency contact first', 'Add an emergency contact first so SOS can reach someone.', [{ text: 'Add contact', onPress: () => router.push('/add-contact') }, { text: 'Cancel', style: 'cancel' }]);
      return;
    }
    Alert.alert('Send SOS?', `This will open your messages app with a help message and your location for ${contacts.map((contact) => contact.name).join(', ')}.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Send SOS', style: 'destructive', onPress: openMessages }]);
  };
  const openMessages = async () => {
    let locationText = "I couldn't share my location.";
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.granted) {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = position.coords;
        const mapLink = `https://www.google.com/maps/search/?api=1&query=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        locationText = `My location: ${mapLink}`;
      }
    } catch { /* SOS still works without a location. */ }
    const message = `I need help. This is an SOS from my Enable Scotland app. ${locationText}`;
    const numbers = contacts.map((contact) => contact.phone).join(',');
    const url = `sms:${numbers}?body=${encodeURIComponent(message)}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert("We couldn't open your messages app.", 'Call one of your contacts instead.');
  };
  return (
    <Screen>
      <Header title="SOS" eyebrow="NEED HELP NOW?" />
      <View style={styles.sosIntro}><Text style={[styles.sosTitle, { color: colors.primaryDark }]}>Send a message for help</Text><Text style={[uiStyles.body, { color: colors.text }]}>Tap SOS to open your messages app with a help message and your location to your emergency contacts.</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Send SOS to your emergency contacts" onPress={sendSos} style={({ pressed }) => [styles.sosButton, { backgroundColor: colors.danger, opacity: pressed ? 0.82 : 1 }]}><Text style={[styles.sosText, { color: colors.onDanger }]}>SOS</Text><Text style={[styles.sosHint, { color: colors.onDanger }]}>Send for help</Text></Pressable>
      <SectionTitle title={`Emergency contacts · ${contacts.length} of 3`} action="Add contact" onAction={() => router.push('/add-contact')} />
      {!contacts.length ? <View style={[styles.infoCard, { backgroundColor: colors.primaryLight }]}><Text style={[uiStyles.body, { color: colors.primaryDark }]}>Add at least one emergency contact so SOS can reach someone.</Text><Button label="Add contact" onPress={() => router.push('/add-contact')} variant="secondary" icon="user-plus" /></View> : contacts.map((contact) => <View key={contact.id} accessible accessibilityLabel={`${contact.name}, ${contact.phone}`} style={[styles.contact, { backgroundColor: colors.surface, borderColor: colors.divider }]}><View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}><Text style={[styles.avatarText, { color: colors.primary }]}>{contact.name.charAt(0).toUpperCase()}</Text></View><View style={styles.contactCopy}><Text style={[uiStyles.cardTitle, { color: colors.text }]}>{contact.name}</Text><Text style={[uiStyles.body, { color: colors.textMuted }]}>{contact.phone}</Text>{contact.relationship ? <Text style={[styles.relationship, { color: colors.textMuted }]}>{contact.relationship}</Text> : null}<View style={styles.contactActions}><Pressable accessibilityRole="button" accessibilityLabel={`Call ${contact.name}`} onPress={() => Linking.openURL(`tel:${contact.phone}`)}><Text style={[styles.actionLink, { color: colors.primary }]}>Call</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Message ${contact.name}`} onPress={() => Linking.openURL(`sms:${contact.phone}`)}><Text style={[styles.actionLink, { color: colors.primary }]}>Message</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Delete ${contact.name}`} onPress={() => Alert.alert('Delete emergency contact?', `Are you sure you want to delete ${contact.name} as an emergency contact?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteContact(contact.id) }])}><Text style={[styles.actionLink, { color: colors.danger }]}>Delete</Text></Pressable></View></View></View>)}
      <View style={[styles.guidance, { backgroundColor: colors.supportLight }]}><Text style={[uiStyles.body, { color: colors.support }]}>If you need help, ask a trusted adult, driver, conductor, or staff member.</Text></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sosIntro: { gap: 7 },
  sosTitle: { fontSize: 22, fontWeight: '700' },
  sosButton: { alignSelf: 'center', width: 182, height: 182, borderRadius: 91, alignItems: 'center', justifyContent: 'center', gap: 2, marginVertical: 4 },
  sosText: { fontSize: 42, fontWeight: '800', letterSpacing: 2 },
  sosHint: { fontSize: 15, fontWeight: '700' },
  infoCard: { borderRadius: 14, padding: 16, gap: 13 },
  contact: { borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  contactCopy: { flex: 1, gap: 2 },
  relationship: { fontSize: 14 },
  contactActions: { flexDirection: 'row', gap: 18, marginTop: 8 },
  actionLink: { fontSize: 15, fontWeight: '700' },
  guidance: { borderRadius: 12, padding: 16 },
});