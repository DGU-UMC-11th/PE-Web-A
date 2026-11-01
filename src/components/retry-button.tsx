export function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <button type="button" onClick={onRetry}
      className="mt-4 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-bold text-white">
      다시 시도
    </button>
  );
}
