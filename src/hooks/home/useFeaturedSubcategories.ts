import { categoryApi } from '@/src/api/category.api';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useFeaturedSubcategories = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: QUERY_KEYS.CATALOG.FEATURED_SUBCATEGORIES,
        queryFn: () => categoryApi.getFeaturedSubcategories(4),
        staleTime: 10 * 60_000,
    });

    return {
        subcategories: data ?? [],
        isLoading,
        error,
        refetch,
    };
};
