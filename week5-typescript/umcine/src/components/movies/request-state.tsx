export function RequestState({ loading, error, empty, retry }: {
  loading: boolean; error: string | null; empty: boolean; retry: () => void;
}) {
  if (loading) return <p role="status" className="py-10 text-gray-500">영화 정보를 불러오는 중이에요.</p>;
  if (error) return <div role="alert" className="py-10"><p>{error}</p><button type="button" className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={retry}>다시 시도</button></div>;
  if (empty) return <p role="status" className="py-10 text-gray-500">조건에 맞는 영화가 없어요.</p>;
  return null;
}
