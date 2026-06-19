import { BottomSheetCloseButton } from '@/src/components/ui/BottomSheetCloseButton';
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
};

const DEFAULT_HANDLE_INDICATOR_STYLE = {
    backgroundColor: '#D1D5DB',
    width: 36,
    height: 4,
    marginTop: 8,
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

        useEffect(() => {
            if (isVisible) {
                isPresentedRef.current = true;
                onPresent?.();
                // Double rAF ensures the bottom sheet portal has completed its
                // first layout pass before we present, otherwise the first
                // present() can be a no-op on cold start.
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        internalRef.current?.present();
                    });
                });
            } else if (isPresentedRef.current) {
                isPresentedRef.current = false;
                internalRef.current?.dismiss();
            }
        }, [isVisible, onPresent]);

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
                        enableDynamicSizing ? (
                            <BottomSheetCloseButton
                                animatedIndex={props.animatedIndex}
                                animatedPosition={props.animatedPosition}
                                onPress={handleClose}
                            />
                        ) : (
                            <BottomSheetCloseButton
                                animatedIndex={props.animatedIndex}
                                onPress={handleClose}
                                bottomOffset={closeButtonOffset!}
                            />
                        )
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
