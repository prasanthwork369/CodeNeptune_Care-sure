import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { icons } from "@/src/constants/icons";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useState, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFaqs } from "@/src/features/home/hooks/useWebsiteContent";
import { useQueryErrorState } from "@/src/hooks/ui/useQueryErrorState";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { exactScale } from "@/src/utils/exactScale";
import type { Faq } from "@/src/features/support/types";
import { styles as s } from "./FaqLayout.styles";

// Each row is validated rather than trusted, in case the CMS returns a
// malformed entry.
const isFaq = (item: unknown): item is Faq =>
  !!item &&
  typeof (item as Faq).question === "string" &&
  typeof (item as Faq).answer === "string";

const FaqSkeleton = () => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    overScrollMode="auto"
    contentContainerStyle={{ padding: exactScale(16) }}
  >
    <View style={s.skeletonCard}>
      {[1, 2, 3, 4, 5].map((_, index) => (
        <View key={index}>
          <View style={s.skeletonRow}>
            <Skeleton
              width={index % 2 === 0 ? "75%" : "85%"}
              height={16}
              borderRadius={4}
            />
            <Skeleton width={16} height={16} borderRadius={8} />
          </View>
          {index < 4 && (
            <View style={{ height: 1, backgroundColor: "#919EAB33" }} />
          )}
        </View>
      ))}
    </View>
  </ScrollView>
);

export const FaqLayout: React.FC = () => {
  const { data: cmsFaqs, isLoading, isFetching, error, refetch } = useFaqs();
  const errorState = useQueryErrorState(error);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: Faq[] = useMemo(
    () => (cmsFaqs ?? []).filter(isFaq),
    [cmsFaqs],
  );

  return (
    <View style={s.root}>
      <ScreenHeader title="FAQs" backgroundColor="#FFFFFF" />
      {isLoading ? (
        <FaqSkeleton />
      ) : errorState === "offline" && faqs.length === 0 ? (
        <NoInternetState
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      ) : errorState && faqs.length === 0 ? (
        <RetryState
          title="Couldn't load FAQs"
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      ) : faqs.length === 0 ? (
        <View style={s.emptyRoot}>
          <Text style={s.emptyText}>No FAQs found at the moment.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          overScrollMode="auto"
          contentContainerStyle={{ padding: exactScale(16) }}
        >
          <View style={s.faqCard}>
            {faqs.map((item, index) => (
              <View key={index}>
                <Touchable
                  onPress={() =>
                    setOpenIndex((prev) => (prev === index ? null : index))
                  }
                  activeOpacity={0.7}
                  style={s.rowTouchable}
                >
                  <Text style={s.rowQuestion}>{item.question}</Text>
                  {openIndex === index ? (
                    <icons.arrow_up width={15} height={15} fill="#1C1B1F" />
                  ) : (
                    <icons.arrow_down width={15} height={15} fill="#1C1B1F" />
                  )}
                </Touchable>
                {openIndex === index && (
                  <View style={s.answerWrap}>
                    <Text style={s.answerText}>{item.answer}</Text>
                  </View>
                )}
                {index < faqs.length - 1 && (
                  <View style={{ height: 1, backgroundColor: "#919EAB33" }} />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};
