import { PrescriptionItem } from '@/src/types/prescription';
import { usePrescriptionDraftStore } from '@/src/store/prescriptionDraftStore';
import { validatePrescriptionFile, MAX_FILES } from '@/src/utils/prescription';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNav } from '@/src/hooks/useNav';

export function usePrescriptionUpload(onError?: (title: string, message: string, onDismiss?: () => void) => void) {
    const router = useNav();
    const { addItems } = usePrescriptionDraftStore();

    const showErr = (title: string, message: string, onDismiss?: () => void) => onError?.(title, message, onDismiss);

    const processAssets = async (
        assets: (DocumentPicker.DocumentPickerAsset | ImagePicker.ImagePickerAsset)[]
    ): Promise<PrescriptionItem[]> => {
        const validated: PrescriptionItem[] = [];
        for (const asset of assets) {
            const item = await validatePrescriptionFile(asset, onError);
            if (item) validated.push(item);
        }
        return validated;
    };

    const pushToPreview = (files: PrescriptionItem[]) => {
        if (files.length === 0) return;

        const currentItems = usePrescriptionDraftStore.getState().items;
        const existingKeys = new Set(currentItems.map(it => `${it.name}_${it.size ?? 0}_${it.type}`));
        const seenKeys = new Set(existingKeys);
        const uniqueInSelection: PrescriptionItem[] = [];
        const skippedCount = { internal: 0, existing: 0 };

        for (const f of files) {
            const key = `${f.name}_${f.size ?? 0}_${f.type}`;
            if (seenKeys.has(key)) {
                existingKeys.has(key) ? skippedCount.existing++ : skippedCount.internal++;
            } else {
                uniqueInSelection.push(f);
                seenKeys.add(key);
            }
        }

        if (currentItems.length + uniqueInSelection.length > MAX_FILES) {
            showErr('Limit Reached', `Maximum ${MAX_FILES} prescriptions allowed.`);
            return;
        }

        if (skippedCount.existing > 0 || skippedCount.internal > 0) {
            const onDismiss = currentItems.length > 0 ? () => router.push('/(prescription)/preview') : undefined;
            showErr('Duplicate Files', 'Some identical files were detected and skipped.', onDismiss);
        }

        if (uniqueInSelection.length === 0) return;

        addItems(uniqueInSelection);
        router.push('/(prescription)/preview');
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
                copyToCacheDirectory: true,
                multiple: true,
            });
            if (result.canceled || result.assets.length === 0) return;
            const validated = await processAssets(result.assets);
            if (validated.length > 0) pushToPreview(validated);
        } catch {
            showErr('Error', 'Failed to pick document. Please try again.');
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showErr('Permission Required', 'Please allow photo library access in Settings to continue.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.9,
                allowsMultipleSelection: true,
            });
            if (result.canceled || result.assets.length === 0) return;
            const validated = await processAssets(result.assets);
            if (validated.length > 0) pushToPreview(validated);
        } catch {
            showErr('Error', 'Failed to pick image. Please try again.');
        }
    };

    const takePhoto = async () => {
        try {
            const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                if (!canAskAgain) showErr('Permission Required', 'Please allow camera access in Settings to continue.');
                return;
            }
            const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
            if (result.canceled || result.assets.length === 0) return;
            const validated = await processAssets(result.assets);
            if (validated.length > 0) pushToPreview(validated);
        } catch {
            showErr('Error', 'Failed to take photo. Please try again.');
        }
    };

    const pickPdf = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],
                copyToCacheDirectory: true,
                multiple: true,
            });
            if (result.canceled || result.assets.length === 0) return;
            const validated = await processAssets(result.assets);
            if (validated.length > 0) pushToPreview(validated);
        } catch {
            showErr('Error', 'Failed to pick PDF. Please try again.');
        }
    };

    return { pickDocument, pickImage, takePhoto, pickPdf };
}
