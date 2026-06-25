import { StyleSheet } from 'react-native';
import { exactScale } from "@/src/utils/exactScale";

export const IMG_SIZE = exactScale(100);

export const styles = StyleSheet.create({
    badge:       { fontSize: exactScale(10) },
    name:        { fontSize: exactScale(14) },
    brand:       { fontSize: exactScale(11) },
    description: { fontSize: exactScale(11) },
    price:       { fontSize: exactScale(16) },
    mrp:         { fontSize: exactScale(12) },
    addBtn:      { fontSize: exactScale(13) },
    counter:     { fontSize: exactScale(18) },
    counterVal:  { fontSize: exactScale(13) },
    imgBox:      { width: IMG_SIZE, height: IMG_SIZE },
    imgInner:    { width: exactScale(54), height: exactScale(54) },
});
