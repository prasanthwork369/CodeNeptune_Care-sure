import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useSystemTemplate } from "@/src/hooks/queries/useSystemTemplates";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { Order } from "@/src/types/order";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { downloadLocalFile } from "@/src/utils/fileDownload";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { File } from "expo-file-system";
import * as Print from "expo-print";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

interface InvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null | undefined;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  "1": "Cash on Delivery",
  "4": "CareSure Wallet",
  COD: "Cash on Delivery",
  WALLET: "CareSure Wallet",
  CARD: "Credit / Debit Card",
  UPI: "UPI",
  NET_BANKING: "Net Banking",
};

function formatDate(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function injectHtmlStyles(
  templateBody: string,
  style: string,
): string {
  const viewport =
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
  if (templateBody.includes("<head>")) {
    return templateBody.replace("<head>", `<head>${viewport}${style}`);
  }
  return `${viewport}${style}${templateBody}`;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  visible,
  onClose,
  order,
}) => {
  const adjustedBottom = useAdjustedBottomInset();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const [downloading, setDownloading] = useState(false);

  const orderReference = order?.orderId
    ? `#${String(order.orderId).replace(/^#/, "")}`
    : order?.id
      ? `#${order.id.substring(0, 8).toUpperCase()}`
      : "";

  const variables = useMemo(() => {
    if (!order) return undefined;
    const rawPaymentMethod =
      order.paymentMethod ?? order.metadata?.paymentMethod ?? "";
    const paymentMethod =
      PAYMENT_METHOD_LABELS[String(rawPaymentMethod).toUpperCase()] ||
      String(rawPaymentMethod || "Not specified");

    return {
      orderId: orderReference,
      orderDate: formatDate(order.createdAt),
      customerName: order.deliveryAddress?.name || "Customer",
      customerPhone:
        order.deliveryAddress?.phone || order.customer?.identifier || "",
      paymentMethod,
      total: Number(order.total ?? 0).toFixed(2),
    };
  }, [order, orderReference]);

  const {
    data: template,
    isLoading,
    isError,
  } = useSystemTemplate(
    "invoice.generated",
    "DOCUMENT",
    variables,
    visible && !!order,
  );

  const previewHtml = useMemo(() => {
    if (!template?.body) return "";
    let body = template.body;

    // Preserve the invoice's native A4 layout width so columns and long text
    // retain their intended geometry. WebView scales this complete canvas to
    // the phone width; CSS zoom is avoided because it can collapse table text.
    const availableWidth = screenWidth - exactScale(40);
    const initialScale = Math.min(1, availableWidth / 794);
    const previewStyle = `
      <style>
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 794px !important;
          min-width: 794px !important;
          max-width: 794px !important;
          -webkit-text-size-adjust: none !important;
          background-color: #ffffff !important;
          overflow-x: hidden !important;
        }
      </style>
    `;
    const metaTag =
      `<meta name="viewport" content="width=794, initial-scale=${initialScale.toFixed(4)}, minimum-scale=${initialScale.toFixed(4)}, maximum-scale=3.0, user-scalable=yes">`;

    if (/<meta[^>]+name=["']viewport["'][^>]*>/i.test(body)) {
      body = body.replace(
        /<meta[^>]+name=["']viewport["'][^>]*>/i,
        metaTag,
      );
      if (body.includes("<head>")) {
        body = body.replace("<head>", `<head>${previewStyle}`);
      } else {
        body = previewStyle + body;
      }
    } else {
      if (body.includes("<head>")) {
        body = body.replace("<head>", `<head>${metaTag}${previewStyle}`);
      } else {
        body = metaTag + previewStyle + body;
      }
    }

    return body;
  }, [screenWidth, template?.body]);

  const printHtml = useMemo(() => {
    if (!template?.body) return "";
    return injectHtmlStyles(
      template.body,
      `<style>
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: auto !important;
          min-width: 0 !important;
          min-height: 0 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          overflow: visible !important;
          zoom: 1 !important;
        }

        /*
         * The system template absolutely positions the invoice footer in its
         * print media rule. Expo Print lays that footer over the savings card
         * when the content is taller than the available A4 area. Keep the
         * footer in normal flow so Savings/Discount and Return Policy retain
         * their full height in the downloaded PDF.
         */
        .page-container {
          width: 210mm !important;
          min-height: 297mm !important;
          height: auto !important;
          overflow: visible !important;
        }

        .savings-banner,
        .invoice-footer,
        .footer-column {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .invoice-footer {
          position: static !important;
          inset: auto !important;
          margin-top: auto !important;
        }

        @page { size: A4 portrait; margin: 0; }
      </style>`,
    );
  }, [template?.body]);

  const handleDownload = async () => {
    if (downloading || !printHtml || !order) return;

    setDownloading(true);
    let temporaryPdfUri: string | null = null;
    try {
      const { uri } = await Print.printToFileAsync({ html: printHtml });
      temporaryPdfUri = uri;
      const safeOrderReference =
        orderReference.replace(/[^a-zA-Z0-9-_]/g, "") || order.id;
      await downloadLocalFile(uri, `Invoice-${safeOrderReference}.pdf`);
    } catch (error: any) {
      if (__DEV__) console.error("[InvoiceDownload]", error);
      Alert.alert(
        "Invoice Download Failed",
        error?.message || "Could not generate the invoice. Please try again.",
      );
    } finally {
      if (Platform.OS === "android" && temporaryPdfUri) {
        try {
          new File(temporaryPdfUri).delete();
        } catch (cleanupError) {
          if (__DEV__) {
            console.log("[InvoiceDownload] temp cleanup failed:", cleanupError);
          }
        }
      }
      setDownloading(false);
    }
  };

  return (
    <GorhomBottomSheet
      isVisible={visible}
      onClose={onClose}
      snapPoints={["82%"]}
      backgroundStyle={{
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: exactScale(12),
        borderTopRightRadius: exactScale(12),
      }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: exactScale(20),
          paddingTop: exactScale(22),
          paddingBottom:
            Math.max(adjustedBottom, exactScale(32)) + exactScale(24),
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: exactScale(16),
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              className="font-inter-bold text-[#1A1C1E]"
              style={{ fontSize: moderateScale(18) }}
            >
              Invoice
            </Text>
            {!!orderReference && (
              <Text
                className="font-inter-medium text-[#6A6A6A]"
                style={{
                  fontSize: moderateScale(12),
                  marginTop: exactScale(2),
                }}
              >
                Order {orderReference}
              </Text>
            )}
          </View>

          <Touchable
            onPress={handleDownload}
            disabled={downloading || !printHtml}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginLeft: exactScale(12), opacity: printHtml ? 1 : 0.45 }}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#0F7635" />
            ) : (
              <icons.download
                width={exactScale(21)}
                height={exactScale(21)}
                fill="#0F7635"
              />
            )}
          </Touchable>
        </View>

        {isLoading && (
          <View
            style={{
              height: screenHeight * 0.58,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" color="#0F7635" />
            <Text
              style={{
                fontSize: moderateScale(13),
                color: "#6B7280",
                marginTop: exactScale(12),
              }}
            >
              Loading invoice…
            </Text>
          </View>
        )}

        {isError && (
          <View
            style={{
              height: screenHeight * 0.58,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: exactScale(24),
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(14),
                fontWeight: "700",
                color: "#DC2626",
              }}
            >
              Could not load invoice
            </Text>
            <Text
              style={{
                fontSize: moderateScale(12),
                color: "#9CA3AF",
                marginTop: exactScale(4),
                textAlign: "center",
              }}
            >
              The invoice template could not be fetched. Please try again later.
            </Text>
          </View>
        )}

        {!isLoading && !isError && previewHtml ? (
          <View
            style={{
              height: screenHeight * 0.63,
              borderRadius: exactScale(12),
              borderWidth: 1,
              borderColor: "#EEEFF1",
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
            }}
          >
            <WebView
              originWhitelist={["*"]}
              source={{ html: previewHtml }}
              style={{ flex: 1, backgroundColor: "#FFFFFF" }}
              containerStyle={{ backgroundColor: "#FFFFFF" }}
              scalesPageToFit
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : null}
      </BottomSheetView>
    </GorhomBottomSheet>
  );
};
