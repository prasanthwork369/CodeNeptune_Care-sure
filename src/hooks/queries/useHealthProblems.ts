import { useQuery } from '@tanstack/react-query';
import { healthProblemApi, HealthProblem } from '../../api/health-problem.api';
import { QUERY_KEYS } from '../../lib/react-query/queryKeys';

export const useHealthProblems = (params?: { isActive?: boolean; search?: string }) => {
    return useQuery<HealthProblem[]>({
        queryKey: QUERY_KEYS.APP.HEALTH_PROBLEMS(params),
        queryFn: () => healthProblemApi.list(params),
        staleTime: 5 * 60 * 1000,
    });
};
