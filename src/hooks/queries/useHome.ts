import { useQuery } from '@tanstack/react-query';
import { homeApi } from '../../api/home.api';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { useCategories } from './useCategories';

export const useHome = () => {
    const { tabs, cards, isLoading: isCategoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();

    const {
        data: appContent,
        isLoading: isContentLoading,
        error: contentError,
        refetch: refetchContent
    } = useQuery({
        queryKey: QUERY_KEYS.APP.CONTENTS,
        queryFn: homeApi.getAppContents,
        staleTime: 10 * 60_000,
    });

    const refetch = async () => {
        await Promise.all([refetchCategories(), refetchContent()]);
    };

    return {
        tabs,
        cards,
        appContent,
        isLoading: isCategoriesLoading || isContentLoading,
        error: categoriesError || contentError,
        refetch
    };
};
