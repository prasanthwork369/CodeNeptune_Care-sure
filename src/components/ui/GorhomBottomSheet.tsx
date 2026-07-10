import { BottomSheetCloseButton } from '@/src/components/ui/BottomSheetCloseButton';
import { exactScale } from '@/src/utils/exactScale';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';
import { Keyboard, Platform } from 'react-native';

interface GorhomBottomSheetProps
    extends Pick<
        BottomSheetModalProps,
        | 'snapPoints'
        | 'index'
        | 'keyboardBehavior'
        | 'keyboardBlurBehavior'
        | 'backgroundStyle'
        | 'handleIndicatorStyle'
        | 'style'
        | 'children'
        | 'maxDynamicContentSize'
        | 'onChange'
    > {
    isVisible: boolean;
    onClose: () => void;
    /** Called right before the sheet is presented, e.g. to refetch data. */
    onPresent?: () => void;
    /**
     * Distance from the bottom of the backdrop where the sheet starts (e.g. "50%").
     * Required when using fixed `snapPoints` (dynamic sizing is disabled in that case).
     * Omit when relying on dynamic sizing (default).
     */
    closeButtonOffset?: number | `${number}%`;
    /** Hide the floating rounded close button, e.g. when content has its own close control. */
    hideCloseButton?: boolean;
}

const DEFAULT_BACKGROUND_STYLE = {
    backgroundColor: '#fff',
    borderTopLeftRadius: exactScale(12),
    borderTopRightRadius: exactScale(12),
};

const DEFAULT_HANDLE_INDICATOR_STYLE = {
    backgroundColor: '#D1D5DB',
    width: exactScale(36),
    height: exactScale(4),
    marginTop: exactScale(8),
};

export const GorhomBottomSheet = forwardRef<BottomSheetModal, GorhomBottomSheetProps>(
    (
        {
            isVisible,
            onClose,
            onPresent,
            closeButtonOffset,
            hideCloseButton = false,
            snapPoints,
            maxDynamicContentSize,
            index = 0,
            keyboardBehavior,
            keyboardBlurBehavior,
            backgroundStyle = DEFAULT_BACKGROUND_STYLE,
            handleIndicatorStyle = DEFAULT_HANDLE_INDICATOR_STYLE,
            style,
            children,
            onChange,
        },
        ref,
    ) => {
        const internalRef = useRef<BottomSheetModal>(null);
        useImperativeHandle(ref, () => internalRef.current as BottomSheetModal);

        const isPresentedRef = useRef(false);

        const hasMountedRef = useRef(false);

        useEffect(() => {
            if (isVisible) {
                isPresentedRef.current = true;
                onPresent?.();
                
                if (!hasMountedRef.current) {
                    // Cold start: needs double rAF for the portal layout pass
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            internalRef.current?.present();
                            hasMountedRef.current = true;
                        });
                    });
                } else {
                    // Already mounted, open instantly!
                    internalRef.current?.present();
                }
            } else if (isPresentedRef.current) {
                isPresentedRef.current = false;
                internalRef.current?.dismiss();
            }
        }, [isVisible, onPresent]);

        useEffect(() => {
            hasMountedRef.current = true;
        }, []);

        const handleDismiss = useCallback(() => {
            isPresentedRef.current = false;
            onClose();
        }, [onClose]);

        const handleClose = useCallback(() => {
            Keyboard.dismiss();
            internalRef.current?.dismiss();
        }, []);

        const enableDynamicSizing = closeButtonOffset === undefined;

        const renderBackdrop = useCallback(
            (props: BottomSheetBackdropProps) => (
                <>
                    <BottomSheetBackdrop
                        {...props}
                        appearsOnIndex={0}
                        disappearsOnIndex={-1}
                        pressBehavior="close"
                    />
                    {!hideCloseButton && (
                        // Always drive the close button from the sheet's live
                        // animatedPosition so it tracks the sheet at ANY snap
                        // point (fixed or dynamic) instead of sitting at a
                        // static offset. closeButtonOffset now only toggles
                        // dynamic sizing (see enableDynamicSizing above).
                        <BottomSheetCloseButton
                            animatedIndex={props.animatedIndex}
                            animatedPosition={props.animatedPosition}
                            onPress={handleClose}
                        />
                    )}
                </>
            ),
            [handleClose, enableDynamicSizing, closeButtonOffset, hideCloseButton],
        );

        return (
            <BottomSheetModal
                ref={internalRef}
                snapPoints={snapPoints}
                index={index}
                enableDynamicSizing={enableDynamicSizing}
                maxDynamicContentSize={maxDynamicContentSize}
                enablePanDownToClose
                onChange={onChange}
                onDismiss={handleDismiss}
                backdropComponent={renderBackdrop}
                keyboardBehavior={keyboardBehavior}
                keyboardBlurBehavior={keyboardBlurBehavior}
                android_keyboardInputMode={
                    Platform.OS === 'android' ? 'adjustResize' : undefined
                }
                backgroundStyle={backgroundStyle}
                handleIndicatorStyle={handleIndicatorStyle}
                style={style}
            >
                {children}
            </BottomSheetModal>
        );
    },
);
GorhomBottomSheet.displayName = "GorhomBottomSheet";
