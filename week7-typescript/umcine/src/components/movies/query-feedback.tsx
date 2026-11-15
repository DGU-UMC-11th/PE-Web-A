interface QueryFeedbackProps {
  isFetching: boolean;
  isPaused: boolean;
  errorMessage?: string | null;
  refetch: () => void;
}

// 캐시를 유지한 채 백그라운드 요청의 상태를 안내해요.
export function QueryFeedback({ isFetching, isPaused, errorMessage, refetch }: QueryFeedbackProps) {
  if (isPaused) return <p role="status" className="my-3 text-sm text-gray-500">네트워크 연결을 기다리고 있어요.</p>;
  if (isFetching) return <p role="status" className="my-3 text-sm text-gray-500">최신 영화 정보를 확인하고 있어요.</p>;
  if (errorMessage) return (
    <div role="alert" className="my-3 text-sm text-red-700">
      <p>{errorMessage} 저장된 정보를 표시하고 있어요.</p>
      <button type="button" className="mt-2 underline" onClick={refetch}>다시 시도</button>
    </div>
  );
  return null;
}
