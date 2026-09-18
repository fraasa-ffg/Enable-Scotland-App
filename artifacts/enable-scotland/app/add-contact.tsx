import { Contact, requestPermissionsAsync } from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useApp } from '@/context/AppContext';
import { Button, Header, Screen, TextField, uiStyles } from '@/components/UI';

export default function AddContactScreen() {
  const router = useRouter();
  const { colors, contacts, addContact } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const validPhone = phone.replace(/\D/g, '').length >= 7 && phone.replace(/\D/g, '').length <= 15;
  const chooseContact = async () => {
    try {
      const permission = await requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Contacts permission needed', "We can't access your contacts. You can still type the contact's details below.", [{ text: 'OK' }]);
        return;
      }
      const selected = await Contact.presentPicker();
      if (!selected) return;
      const [selectedName, phones] = await Promise.all([selected.getFullName(), selected.getPhones()]);
      const selectedPhone = phones.find((item) => item.number?.trim())?.number?.trim();
      if (!selectedPhone) {
        Alert.alert('No phone number found', "This contact doesn't have a phone number. You can still type the contact's details below.", [{ text: 'OK' }]);
        return;
      }
      setName(selectedName.trim());
      setPhone(selectedPhone);
    } catch {
      Alert.alert('Contacts unavailable', "We couldn't choose a contact. You can still type the contact's details below.", [{ text: 'OK' }]);
    }
  };
  const save = async () => {
    if (!name.trim() || !validPhone) return;
    const saved = await addContact({ name: name.trim(), phone, relationship: relationship.trim() });
    if (!saved) Alert.alert('Contact not saved', contacts.length >= 3 ? 'You can have up to 3 emergency contacts. Delete one to add another.' : 'This number is already an emergency contact.');
    else router.back();
  };
  return <Screen><Header title="Add contact" eyebrow="EMERGENCY CONTACTS" /><Text style={[uiStyles.body, { color: colors.textMuted }]}>Add someone you trust to your emergency contacts.</Text><Button label="Choose from phone contacts" onPress={chooseContact} variant="secondary" icon="book-open" /><TextField label="Name" value={name} onChangeText={setName} placeholder="e.g. Alex Smith" /><TextField label="Phone number" value={phone} onChangeText={setPhone} placeholder="e.g. 07123 456789" keyboardType="phone-pad" /><TextField label="Relationship (optional)" value={relationship} onChangeText={setRelationship} placeholder="e.g. Support worker" /><Text style={[styles.previewLabel, { color: colors.primaryDark }]}>Preview</Text><Text style={[styles.preview, { color: colors.text, borderColor: colors.divider }]}>{name || 'Contact name'}{'\n'}{phone || 'Phone number'}{relationship ? `\n${relationship}` : ''}</Text><Button label="Save contact" onPress={save} disabled={!name.trim() || !validPhone} icon="check" /></Screen>;
}

const styles = StyleSheet.create({
  previewLabel: { fontSize: 18, fontWeight: '700' },
  preview: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, lineHeight: 24 },
});