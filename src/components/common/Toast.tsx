import { useToastStore } from '@/src/store/toastStore';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";

const CONFIG = {
  success: {
    cardBg: '#F0FDF4', cardBorder: '#BBF7D0',
    wrapBg: '#DCFCE7',
    iconBg: '#22C55E', iconColor: '#fff', icon: '✓',
  },
  warning: {
    cardBg: '#FFFBEB', cardBorder: '#FDE68A',
    wrapBg: '#FEF9C3',
    iconBg: '#F59E0B', iconColor: '#fff', icon: '!',
  },
  error: {
    cardBg: '#FFF1F2', cardBorder: '#FECDD3',
    wrapBg: '#FFE4E6',
    iconBg: '#EF4444', iconColor: '#fff', icon: '✕',
  },
};

export const Toast: React.FC = () => {
  const { visible, message, type, hide } = useToastStore();
  const insets = useSafeAreaInsets();
  const adjustedBottom = useAdjustedBottomInset();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // Hidden resting position: below the screen when anchored to the bottom,
  // above it when anchored to the top (keyboard open) — so the slide
  // direction always matches which edge the toast is docked to.
  const offScreenY = keyboardVisible ? -120 : 120;
  const translateY = useRef(new Animated.Value(offScreenY)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 10, tension: 60 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: offScreenY, duration: 280, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]).start(() => hide());
      }, 3200);
    } else {
      translateY.setValue(offScreenY);
      opacity.setValue(0);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible, message]);

  if (!visible) return null;

  const c = CONFIG[type];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        ...(keyboardVisible
          ? { top: insets.top + 12 }
          : { bottom: adjustedBottom + 100 }),
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 999999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View
        style={{
          width: exactScale(343),
          backgroundColor: c.cardBg,
          borderWidth: 1,
          borderColor: c.cardBorder,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 9,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {/* Outer rounded wrapper — matches web icon container */}
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: c.wrapBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
            flexShrink: 0,
          }}
        >
          {/* Inner filled circle */}
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: c.iconBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: c.iconColor, fontSize: 11, fontWeight: '700', lineHeight: 13 }}>
              {c.icon}
            </Text>
          </View>
        </View>

        <Text
          style={{ flex: 1, fontSize: 12.5, fontWeight: '500', color: '#1A1A1A', lineHeight: 18 }}
          numberOfLines={3}
        >
          {message}
        </Text>

        <Pressable
          onPress={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            Animated.parallel([
              Animated.timing(translateY, { toValue: 120, duration: 250, useNativeDriver: true }),
              Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
            ]).start(() => hide());
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginLeft: 10, padding: 4 }}
        >
          <Text style={{ fontSize: 14, color: '#9CA3AF', fontWeight: '700', lineHeight: 16 }}>✕</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};
