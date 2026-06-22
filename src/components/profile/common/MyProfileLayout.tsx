import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { GorhomBottomSheet } from '@/src/components/ui/GorhomBottomSheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { icons } from '@/src/constants/icons';
import { useProfile } from '@/src/hooks/queries/useProfile';
import { UpdateProfilePayload } from '@/src/api/profile.api';
import { useIsOffline } from '@/src/hooks/ui/useIsOffline';
import { useNav } from '@/src/hooks/useNav';
import { Touchable } from '@/src/components/ui/Touchable';
import { DatePickerModal } from '@/src/components/ui/DatePickerModal';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GENDERS = ['Male', 'Female', 'Other'];

const Field: React.FC<{
    label: string;
    value: string;
    onChangeText?: (v: string) => void;
    placeholder?: string;
    editable?: boolean;
    keyboardType?: any;
    rightSlot?: React.ReactNode;
}> = ({ label, value, onChangeText, placeholder, editable = true, keyboardType = 'default', rightSlot }) => (
    <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#222222', marginBottom: 6 }}>
            {label}
        </Text>
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: editable ? '#FFFFFF' : '#F5F6FB',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#E8E8E8',
            paddingHorizontal: 14,
            height: 48,
        }}>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#AAAAAA"
                editable={editable}
                keyboardType={keyboardType}
                style={{ flex: 1, fontSize: 14, color: editable ? '#111827' : '#637381', padding: 0 }}
            />
            {rightSlot}
        </View>
    </View>
);

export const MyProfileLayout: React.FC = () => {
    const router = useNav();
    const { profile, updating, error, updateProfile } = useProfile();
    const isOffline = useIsOffline();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGenderSheet, setShowGenderSheet] = useState(false);

    useEffect(() => {
        if (!profile) return;
        setFirstName(profile.firstName ?? '');
        setLastName(profile.lastName ?? '');
        setEmail(profile.email ?? '');
        if (profile.gender) {
            const g = profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).toLowerCase();
            setGender(GENDERS.includes(g as any) ? g : '');
        }
        if (profile.dateOfBirth) setDob(new Date(profile.dateOfBirth));
    }, [profile]);

    const formattedDob = dob
        ? `${String(dob.getDate()).padStart(2, '0')}-${String(dob.getMonth() + 1).padStart(2, '0')}-${dob.getFullYear()}`
        : '';

    const handleGenderPick = () => setShowGenderSheet(true);

    const handleSave = async () => {
        try {
            const payload: UpdateProfilePayload = {};
            if (firstName.trim()) payload.firstName = firstName.trim();
            if (lastName.trim()) payload.lastName = lastName.trim();
            payload.email = email.trim();
            if (gender) payload.gender = gender.toUpperCase();
            if (dob) payload.dateOfBirth = dob.toISOString();

            if (Object.keys(payload).length === 0) return;

            await updateProfile(payload);
            router.back();
        } catch (err: any) {
            if (__DEV__) {
                console.error('[Profile Update Error]', err);
                // Log full API validation details to identify which field is failing
                if (err?.data) console.error('[Profile Update Details]', JSON.stringify(err.data, null, 2));
            }
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => {} },
            ],
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FB' }}>
            <ScreenHeader title="My Profile" backgroundColor="#FFFFFF" showBorder />

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
            >
                {/* First Name */}
                <Field label="First Name" value={firstName} onChangeText={setFirstName} placeholder="Enter first name" />

                {/* Last Name */}
                <Field label="Last Name" value={lastName} onChangeText={setLastName} placeholder="Enter last name" />

                {/* Mobile Number */}
                <Field label="Mobile Number" value={profile?.phoneNumber ?? ''} editable={false} keyboardType="phone-pad" />

                {/* Email */}
                <Field
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    rightSlot={
                        email ? (
                            <Touchable onPress={() => {}} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F7635' }}>Verify</Text>
                            </Touchable>
                        ) : null
                    }
                />

                {/* Gender + Date of Birth row */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    {/* Gender */}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#222222', marginBottom: 6 }}>Gender</Text>
                        <Touchable
                            onPress={handleGenderPick}
                            activeOpacity={0.8}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#FFFFFF',
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#E8E8E8',
                                paddingHorizontal: 14,
                                height: 48,
                            }}
                        >
                            <Text style={{ flex: 1, fontSize: 14, color: gender ? '#111827' : '#AAAAAA' }}>
                                {gender || 'Select'}
                            </Text>
                            <icons.down_arrow width={16} height={16} />
                        </Touchable>
                    </View>

                    {/* Date of Birth */}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#222222', marginBottom: 6 }}>Date of Birth</Text>
                        <Touchable
                            onPress={() => setShowDatePicker(true)}
                            activeOpacity={0.8}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#FFFFFF',
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#E8E8E8',
                                paddingHorizontal: 14,
                                height: 48,
                            }}
                        >
                            <Text style={{ flex: 1, fontSize: 14, color: formattedDob ? '#111827' : '#AAAAAA' }}>
                                {formattedDob || 'DD-MM-YYYY'}
                            </Text>
                            <icons.calendar_month width={18} height={18} />
                        </Touchable>
                    </View>
                </View>

                <DatePickerModal
                    visible={showDatePicker}
                    value={dob ?? new Date(2000, 0, 1)}
                    maximumDate={new Date()}
                    onClose={() => setShowDatePicker(false)}
                    onChange={(date) => setDob(date)}
                />

                {error ? (
                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#EF4444', marginBottom: 12 }}>{error}</Text>
                ) : null}

                {/* Delete Account */}
                <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: '#E8E8E8', paddingTop: 20 }}>
                    <Touchable onPress={handleDeleteAccount} activeOpacity={0.7} style={{ marginBottom: 6 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#CA2B25' }}>Delete Account</Text>
                    </Touchable>
                    <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 20 }}>
                        Deleting your account will remove all your order, wallet amount and any active referral
                    </Text>
                </View>
            </ScrollView>

            {/* Save Changes */}
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#F5F6FB' }}>
                <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 }}>
                    <Touchable
                        onPress={handleSave}
                        disabled={updating || isOffline}
                        activeOpacity={0.85}
                        style={{
                            backgroundColor: '#0F7635',
                            borderRadius: 10,
                            height: 52,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: updating || isOffline ? 0.5 : 1,
                        }}
                    >
                        {updating
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>Save Changes</Text>
                        }
                    </Touchable>
                </View>
            </SafeAreaView>

            {/* Gender Picker Sheet */}
            <GorhomBottomSheet
                isVisible={showGenderSheet}
                onClose={() => setShowGenderSheet(false)}
            >
              <BottomSheetView style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 }}>Select Gender</Text>
                {GENDERS.map((g, i) => (
                    <Touchable
                        key={g}
                        onPress={() => { setGender(g); setShowGenderSheet(false); }}
                        activeOpacity={0.8}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingVertical: 14,
                            borderBottomWidth: i < GENDERS.length - 1 ? 1 : 0,
                            borderBottomColor: '#F3F4F6',
                        }}
                    >
                        <Text style={{ fontSize: 15, fontWeight: gender === g ? '600' : '400', color: gender === g ? '#0F7635' : '#111827' }}>
                            {g}
                        </Text>
                        {gender === g && <icons.check_circle width={20} height={20} fill="#0F7635" />}
                    </Touchable>
                ))}
                <View style={{ height: 8 }} />
              </BottomSheetView>
            </GorhomBottomSheet>
        </View>
    );
};
