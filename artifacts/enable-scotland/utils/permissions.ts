import { Alert, Linking, Platform } from 'react-native';

type PermissionResult = {
  granted: boolean;
  canAskAgain?: boolean;
};

export function showPermissionFallback(permission: PermissionResult, title: string, message: string) {
  const buttons: Parameters<typeof Alert.alert>[2] = [{ text: 'OK' }];

  if (!permission.granted && permission.canAskAgain === false && Platform.OS !== 'web') {
    buttons.push({
      text: 'Open Settings',
      onPress: () => {
        void Linking.openSettings().catch(() => undefined);
      },
    });
  }

  Alert.alert(title, message, buttons);
}