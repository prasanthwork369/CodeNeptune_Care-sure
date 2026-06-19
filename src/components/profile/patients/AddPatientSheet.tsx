import { icons } from '@/src/constants/icons';
import { profileStyles as s } from '../profile.styles';
import { formatDobDisplay, getMaxDob } from '@/src/utils/patient';
import { FamilyMember, FamilyMemberInput } from '@/src/types/familyMember';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GorhomBottomSheet } from '@/src/components/ui/GorhomBottomSheet';
import { Touchable } from '@/src/components/ui/Touchable';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AddPatientSheetProps {
    isVisible: boolean;
    onClose: () => void;
    onAdd: (patient: FamilyMemberInput) => Promise<void>;
    editPatient?: FamilyMember | null;
    onEdit?: (id: string, patient: FamilyMemberInput) => Promise<void>;
    onDelete?: (id: string) => void;
}

const RELATIONSHIPS = ['Self', 'Wife', 'Husband', 'Mother', 'Father', 'Other'];

const GENDERS = [
    { label: 'Male', value: 'MALE', icon: <icons.male width={16} height={16} /> },
    { label: 'Female', value: 'FEMALE', icon: <icons.female width={16} height={16} /> },
    { label: 'Prefer not to say', value: 'OTHER', icon: <icons.back_hand width={16} height={16} /> },
];

export function AddPatientSheet({ isVisible, onClose, onAdd, editPatient, onEdit, onDelete }: AddPatientSheetProps) {
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [dob, setDob] = useState('');
    const [dobDate, setDobDate] = useState<Date>(new Date(2000, 0, 1));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [relationship, setRelationship] = useState('');
    const [otherRelationship, setOtherRelationship] = useState('');
    const [gender, setGender] = useState('');
    const [errors, setErrors] = useState<{ name?: string; dob?: string; relationship?: string; mobile?: string; gender?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inFlight = useRef(false);

    const isEditMode = !!editPatient;
    const mobileRef = useRef<React.ElementRef<typeof BottomSheetTextInput>>(null);
    const maxDob = getMaxDob();

    useEffect(() => {
        if (isVisible && editPatient) {
            setName(editPatient.name ?? '');
            const rawPhone = editPatient.phone ?? '';
            setMobile(rawPhone.startsWith('+91') ? rawPhone.slice(3) : rawPhone);
            setDob(editPatient.dateOfBirth ?? '');
            if (editPatient.dateOfBirth) setDobDate(new Date(editPatient.dateOfBirth));
            const rel = editPatient.relationship ?? '';
            const isOther = !RELATIONSHIPS.slice(0, -1).includes(rel);
            setRelationship(isOther && rel ? 'Other' : rel);
            setOtherRelationship(isOther ? rel : '');
            setGender(editPatient.gender ?? '');
            setErrors({});
        } else if (isVisible && !editPatient) {
            setName(''); setMobile(''); setDob('');
            setDobDate(new Date(2000, 0, 1));
            setRelationship(''); setOtherRelationship(''); setGender('');
            setErrors({});
        }
    }, [isVisible, editPatient]);

    const handleSubmit = async () => {
        const newErrors: typeof errors = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!dob) newErrors.dob = 'Date of birth is required';
        if (!relationship) newErrors.relationship = 'Please select a relationship';
        else if (relationship === 'Other' && !otherRelationship.trim()) newErrors.relationship = 'Please specify the relationship';
        if (!mobile) newErrors.mobile = 'Mobile number is required';
        else if (mobile.length !== 10) newErrors.mobile = 'Enter a valid 10-digit number';
        if (!gender) newErrors.gender = 'Please select a gender';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        const payload: FamilyMemberInput = {
            name: name.trim(),
            relationship: relationship === 'Other' ? otherRelationship.trim() : relationship,
            dateOfBirth: dob,
            gender,
            phone: `+91${mobile}`,
        };

        if (inFlight.current) return;
        inFlight.current = true;
        setIsSubmitting(true);
        try {
            if (isEditMode && editPatient && onEdit) await onEdit(editPatient.id, payload);
            else await onAdd(payload);
            onClose();
        } catch {
            inFlight.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <>
        <GorhomBottomSheet
            isVisible={isVisible}
            onClose={onClose}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            backgroundStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        >
                    <BottomSheetScrollView style={{ paddingHorizontal: 20 }}
                        contentContainerStyle={{ paddingTop: 24, paddingBottom: insets.bottom + 24 }}
                        showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never"
                        keyboardShouldPersistTaps="handled">

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={s.patientTitle} className="font-inter-semibold text-[#222222]">
                                {isEditMode ? 'Edit Patient' : 'Add Family Member'}
                            </Text>
                        </View>

                        <Text className="text-[14px] font-inter-bold text-brand-text mb-2">Name</Text>
                        <BottomSheetTextInput placeholder="Enter the name" placeholderTextColor="#919EAB" style={[input, errors.name ? { borderColor: '#EF4444' } : {}]}
                            value={name} onChangeText={t => { setName(t); setErrors(e => ({ ...e, name: undefined })); }}
                            returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => mobileRef.current?.focus()} autoCorrect={false} />
                        {errors.name && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: -12, marginBottom: 12 }}>{errors.name}</Text>}

                        <Text className="text-[14px] font-inter-bold text-brand-text mb-2">Mobile Number</Text>
                        <View style={[{ flexDirection: 'row', alignItems: 'center', height: 52 }, input, errors.mobile ? { borderColor: '#EF4444' } : {}, { paddingVertical: 0, paddingHorizontal: 16, marginBottom: 18 }]}>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: '#1A1C1E', marginRight: 8 }}>+91 |</Text>
                            <BottomSheetTextInput ref={mobileRef} placeholder="10 digit number" placeholderTextColor="#919EAB" keyboardType="phone-pad" maxLength={10} returnKeyType="done"
                                style={{ flex: 1, fontSize: 14, fontFamily: 'Inter-Medium', color: '#1A1C1E', height: '100%' }}
                                value={mobile} onChangeText={t => { const d = t.replace(/\D/g, ''); setMobile(d); setErrors(e => ({ ...e, mobile: undefined })); }} />
                        </View>
                        {errors.mobile && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: -12, marginBottom: 12 }}>{errors.mobile}</Text>}

                        <Text className="text-[14px] font-inter-bold text-brand-text mb-2">Relationship</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: errors.relationship && relationship !== 'Other' ? 6 : 18 }}>
                            {RELATIONSHIPS.map((item) => {
                                const sel = relationship === item;
                                return (
                                    <Touchable key={item} onPress={() => { setRelationship(item); setErrors(e => ({ ...e, relationship: undefined })); }} className="rounded-lg"
                                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 7, paddingHorizontal: 14, borderWidth: 1, borderColor: sel ? '#0F763533' : '#919EAB33', backgroundColor: sel ? '#F1FFF6' : '#fff', gap: 5 }}>
                                        <Text className='text-[13px] font-inter-medium' style={{ color: sel ? '#0F7635' : '#6A6A6A' }}>{item}</Text>
                                    </Touchable>
                                );
                            })}
                        </View>
                        {errors.relationship && relationship !== 'Other' && <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12 }}>{errors.relationship}</Text>}
                        {relationship === 'Other' && (
                            <>
                                <BottomSheetTextInput placeholder="Specify relationship" placeholderTextColor="#919EAB"
                                    style={[input, { marginTop: -10, marginBottom: errors.relationship ? 6 : 18 }, errors.relationship ? { borderColor: '#EF4444' } : {}]}
                                    value={otherRelationship} onChangeText={t => { setOtherRelationship(t); setErrors(e => ({ ...e, relationship: undefined })); }}
                                    autoCorrect={false} autoFocus />
                                {errors.relationship && <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12 }}>{errors.relationship}</Text>}
                            </>
                        )}

                        <Text className="text-[14px] font-inter-bold text-brand-text mb-2">Date Of Birth</Text>
                        {errors.dob && <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 6 }}>{errors.dob}</Text>}
                        <Touchable onPress={() => { setShowDatePicker(true); setErrors(e => ({ ...e, dob: undefined })); }}
                            style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: errors.dob ? '#EF4444' : '#919EAB33', borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#fff', marginBottom: 18 }} activeOpacity={0.8}>
                            <Text style={{ flex: 1, paddingVertical: 14, fontSize: 14, fontFamily: 'Inter-Medium', color: dob ? '#1A1C1E' : '#919EAB' }}>
                                {formatDobDisplay(dob) || 'DD-MM-YYYY'}
                            </Text>
                            <icons.calendar_month width={20} height={20} fill="#919EAB" />
                        </Touchable>
                        {showDatePicker && (
                            <DateTimePicker value={dobDate} mode="date" display="default" maximumDate={maxDob}
                                onChange={(_, selected) => {
                                    setShowDatePicker(false);
                                    if (selected) {
                                        setDobDate(selected);
                                        const d = selected.getDate().toString().padStart(2, '0');
                                        const m = (selected.getMonth() + 1).toString().padStart(2, '0');
                                        const y = selected.getFullYear();
                                        setDob(`${y}-${m}-${d}`);
                                    }
                                }} />
                        )}

                        <Text className="text-[14px] font-inter-bold text-brand-text mb-2">Gender</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: errors.gender ? 6 : 28 }}>
                            {GENDERS.map(({ label: g, value: gVal, icon }) => {
                                const sel = gender === gVal;
                                return (
                                    <Touchable key={gVal} onPress={() => { setGender(gVal); setErrors(e => ({ ...e, gender: undefined })); }} className="rounded-lg"
                                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: sel ? '#0F763533' : '#919EAB33', backgroundColor: sel ? '#F1FFF6' : '#fff', gap: 5 }}>
                                        {React.cloneElement(icon as React.ReactElement<any>, { color: sel ? '#0F7635' : '#919EAB' })}
                                        <Text className='font-inter-medium' style={{ fontSize: 11, color: sel ? '#0F7635' : '#6A6A6A' }}>{g}</Text>
                                    </Touchable>
                                );
                            })}
                        </View>
                        {errors.gender && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: -4, marginBottom: 16 }}>{errors.gender}</Text>}

                        <Touchable onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.85}
                            style={{ backgroundColor: '#0F7635', borderRadius: 14, paddingVertical: 16, alignItems: 'center', opacity: isSubmitting ? 0.75 : 1 }}>
                            {isSubmitting
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Text style={{ fontSize: 15, fontFamily: 'Inter-SemiBold', color: '#fff' }}>{isEditMode ? 'Save Changes' : 'Add Patient'}</Text>
                            }
                        </Touchable>
                    </BottomSheetScrollView>
        </GorhomBottomSheet>
        </>
    );
}

const input: object = {
    borderWidth: 1, borderColor: '#919EAB33', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, fontFamily: 'Inter-Medium', color: '#1A1C1E',
    backgroundColor: '#fff', marginBottom: 18,
};
