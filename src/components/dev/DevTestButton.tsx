import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { exactScale } from '@/src/utils/exactScale';

// ----------------------------------------------------
// UPDATE THESE VALUES ANYTIME TO TEST DIFFERENT SCREENS
// ----------------------------------------------------
const TEST_PATH = '/profile/orders/return-success';
const TEST_NAME = 'Dev: Test Return';
const SHOW_DEV_BUTTON = false; // flip to true when you need it

export function DevTestButton() {
  const router = useRouter();

  if (!__DEV__ || !SHOW_DEV_BUTTON) return null;

  return (
    <View style={{ position: 'absolute', bottom: 120, right: 20, zIndex: 99999, elevation: 99999 }}>
      <TouchableOpacity
        onPress={() => router.push(TEST_PATH as any)}
        style={{
          backgroundColor: '#2563EB',
          paddingVertical: exactScale(10),
          paddingHorizontal: exactScale(16),
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 5,
        }}
      >
        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{TEST_NAME}</Text>
      </TouchableOpacity>
    </View>
  );
}
