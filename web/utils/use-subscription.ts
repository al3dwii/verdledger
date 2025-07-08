import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export const useSubscription = () => {
  const { data, error } = useSWR('/api/me/subscription', fetcher);
  return { status: data?.status, isLoading: !data && !error, error };
};
