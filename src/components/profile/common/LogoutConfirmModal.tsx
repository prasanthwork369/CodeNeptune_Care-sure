import { icons } from '@/src/constants/icons';
import React from 'react';
import { ConfirmActionModal } from './ConfirmActionModal';

interface LogoutConfirmModalProps {
    isVisible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    isLoggingOut?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ isVisible, onCancel, onConfirm, isLoggingOut }) => {
    return (
        <ConfirmActionModal
            isVisible={isVisible}
            message="Are you sure you want to logout"
            icon={<icons.logout width={36} height={36} fill="#CA2B25" />}
            isLoading={isLoggingOut}
            onCancel={onCancel}
            onConfirm={onConfirm}
        />
    );
};
