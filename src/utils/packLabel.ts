interface PackLabelInput {
    packSize?: string | number | null;
    unit?: string | null;
    dosageForm?: string | null;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const formatPackLabel = ({ packSize, unit, dosageForm }: PackLabelInput): string => {
    const packSizeText = String(packSize ?? '').trim() || '1';

    if (unit) {
        return `${capitalize(unit)} of ${packSizeText}${dosageForm ? ` ${dosageForm}s` : ''}`;
    }
    if (dosageForm) {
        return `${dosageForm} of ${packSizeText}`;
    }
    return `Pack of ${packSizeText}`;
};
