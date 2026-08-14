import type { UseQueryResult } from '@tanstack/react-query';

type QueryLoadState = Pick<UseQueryResult<unknown>, 'isPending' | 'data'>;

/** True only on the first fetch when no cached data exists yet. */
export const isQueryInitialLoad = (query: QueryLoadState): boolean => {
  return query.isPending && query.data === undefined;
};

export const isAnyQueryInitialLoad = (...queries: QueryLoadState[]): boolean => {
  return queries.some(isQueryInitialLoad);
};
