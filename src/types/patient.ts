import { FamilyMember } from './familyMember';
import { HealthProblem } from '../constants/data';

export interface PatientPrescriptionPreviewProps {
    items: { localUri: string; name: string; type: string }[];
    onAddPress?: () => void;
    onItemPress?: (index: number) => void;
}

export interface PatientSelectionChipsProps {
    members: FamilyMember[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    loading: boolean;
}

export interface PatientContactInfoProps {
    phone: string;
    isEditing: boolean;
    onEdit: () => void;
    onSave: (val: string) => void;
    saving: boolean;
}

export interface PatientVitalInfoProps {
    age: string;
    gender: 'MALE' | 'FEMALE' | string;
}

export interface PatientHealthProblemProps {
    selected: HealthProblem | null;
    onPress: () => void;
}

export interface PatientSymptomsInputProps {
    value: string;
    onChangeText: (text: string) => void;
}

export interface PatientSelectionFooterProps {
    toPay: string;
    patientName: string | null;
    safeAreaBottom: number;
    onProceed: () => void;
}
