import React from 'react';
import { AlertDialog } from './AlertDialog';

interface DeleteConfirmDialogProps {
    visible: boolean;
    title?: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export function DeleteConfirmDialog({
    visible,
    title = 'Are you sure you want to delete this?',
    onCancel,
    onConfirm,
}: DeleteConfirmDialogProps) {
    return (
        <AlertDialog
            visible={visible}
            onClose={onCancel}
            icon="delete"
            title={title}
            buttons={[
                { label: 'Cancel', onPress: onCancel, variant: 'outline' },
                { label: 'Delete', onPress: onConfirm, variant: 'red' },
            ]}
        />
    );
}
