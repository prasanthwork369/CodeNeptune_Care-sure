import { icons } from '@/src/constants/icons';
import { Touchable } from '@/src/components/ui/Touchable';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

export interface ReasonOption {
  id: number | string;
  label: string;
}

interface ReasonDropdownProps {
  options: ReasonOption[];
  loading?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  selectedLabel?: string | null;
  selectedId: number | string | null;
  onSelect: (id: number | string) => void;
  includeOther?: boolean;
  isOtherSelected?: boolean;
  onSelectOther?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxListHeight?: number;
}

/** Shared "tap to open a floating list" reason picker -- used by both the
 * cancel-order and return-reason flows so they look/behave identically. */
export function ReasonDropdown({
  options,
  loading,
  isOpen,
  onToggle,
  selectedLabel,
  selectedId,
  onSelect,
  includeOther = false,
  isOtherSelected = false,
  onSelectOther,
  disabled,
  placeholder = 'Select a reason',
  maxListHeight = 220,
}: ReasonDropdownProps) {
  return (
    <View style={{ width: '100%', zIndex: 10 }}>
      <Touchable
        onPress={onToggle}
        disabled={disabled || loading}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          borderWidth: 1,
          borderColor: isOpen ? '#0F7635' : '#E5E7EB',
          backgroundColor: '#fff',
          borderRadius: 10,
          paddingVertical: 14,
          paddingHorizontal: 14,
        }}
      >
        <Text
          numberOfLines={1}
          style={{ flex: 1, fontSize: 13, fontWeight: '500', color: selectedLabel ? '#1A1C1E' : '#9CA3AF' }}
        >
          {selectedLabel ?? placeholder}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#0F7635" />
        ) : (
          <icons.down_arrow
            width={14}
            height={14}
            fill="#6B7280"
            style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
          />
        )}
      </Touchable>

      {isOpen && (
        <View
          style={{
            position: 'absolute',
            top: 52,
            left: 0,
            right: 0,
            zIndex: 999,
            elevation: 10,
            backgroundColor: '#fff',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            overflow: 'hidden',
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} nestedScrollEnabled style={{ maxHeight: maxListHeight }}>
            {options.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <Touchable
                  key={item.id}
                  onPress={() => onSelect(item.id)}
                  disabled={disabled}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 13,
                    paddingHorizontal: 14,
                    backgroundColor: isSelected ? '#F1FFF6' : '#fff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: isSelected ? '#0F7635' : '#1A1C1E' }}>
                    {item.label}
                  </Text>
                  {isSelected && <icons.check_circle width={16} height={16} fill="#0F7635" />}
                </Touchable>
              );
            })}
          </ScrollView>

          {/* "Other" sits outside the scroll area so it's always visible/reachable,
              even when the reasons list overflows maxListHeight and needs scrolling
              (which doesn't work reliably when nested inside a bottom sheet's own
              scroll view, e.g. the return-reason modal). */}
          {includeOther && (
            <Touchable
              onPress={onSelectOther}
              disabled={disabled}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 13,
                paddingHorizontal: 14,
                backgroundColor: isOtherSelected ? '#F1FFF6' : '#fff',
                borderTopWidth: 1,
                borderTopColor: '#E5E7EB',
              }}
            >
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: isOtherSelected ? '#0F7635' : '#1A1C1E' }}>
                Other
              </Text>
              {isOtherSelected && <icons.check_circle width={16} height={16} fill="#0F7635" />}
            </Touchable>
          )}
        </View>
      )}
    </View>
  );
}
