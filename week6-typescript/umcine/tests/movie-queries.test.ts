import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { movieQueries } from "../src/queries/movies/movie-queries";
import { getMovies } from "../src/api/movies/get-movies";
import { searchMovies } from "../src/api/movies/search-movies";
import { getMovieDetail } from "../src/api/movies/get-movie-detail";
import { queryClient } from "../src/config/query-client";

vi.mock("../src/api/movies/get-movies", () => ({ getMovies: vi.fn() }));
vi.mock("../src/api/movies/search-movies", () => ({ searchMovies: vi.fn() }));
vi.mock("../src/api/movies/get-movie-detail", () => ({ getMovieDetail: vi.fn() }));

const clients: QueryClient[] = [];
function createClient() {
  const client = new QueryClient({ defaultOptions: queryClient.getDefaultOptions() });
  clients.push(client);
  return client;
}
const listResponse = (page: number) => ({ page, results: [], total_pages: 2, total_results: 0 });

afterEach(() => {
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("movie queries", () => {
  it("1 → 2 → 1: fresh한 1페이지는 재요청하지 않는다", async () => {
    const client = createClient();
    vi.mocked(getMovies).mockImplementation(async ({ page = 1 } = {}) => listResponse(page));
    const first = await client.fetchQuery(movieQueries.list(1));
    await client.fetchQuery(movieQueries.list(2));
    expect(await client.fetchQuery(movieQueries.list(1))).toBe(first);
    expect(getMovies).toHaveBeenCalledTimes(2);
    expect(client.getQueryCache().getAll()).toHaveLength(2);
  });

  it("목록·검색어·페이지별 캐시를 구분하고 검색어 공백을 정규화한다", async () => {
    const client = createClient();
    vi.mocked(searchMovies).mockImplementation(async ({ page = 1 }) => listResponse(page));
    vi.mocked(getMovies).mockResolvedValue(listResponse(1));
    await client.fetchQuery(movieQueries.list(1));
    await client.fetchQuery(movieQueries.search(" 인셉션 ", 1));
    await client.fetchQuery(movieQueries.search("인셉션", 1));
    await client.fetchQuery(movieQueries.search("인셉션", 2));
    await client.fetchQuery(movieQueries.search("인터스텔라", 1));
    expect(searchMovies).toHaveBeenCalledTimes(3);
    expect(client.getQueryCache().getAll()).toHaveLength(4);
    expect(searchMovies).toHaveBeenCalledWith({ query: "인셉션", page: 1 });
  });

  it("빈 검색어는 pending이지만 loading은 아니며 요청하지 않는다", () => {
    const observer = new QueryObserver(createClient(), movieQueries.search("   ", 1));
    const unsubscribe = observer.subscribe(() => {});
    expect(observer.getCurrentResult().isPending).toBe(true);
    expect(observer.getCurrentResult().isLoading).toBe(false);
    expect(searchMovies).not.toHaveBeenCalled();
    unsubscribe();
  });

  it.each([0, -1, 1.5, NaN, Infinity])("잘못된 상세 ID %s는 요청하지 않는다", (id) => {
    const observer = new QueryObserver(createClient(), movieQueries.detail(id));
    const unsubscribe = observer.subscribe(() => {});
    expect(observer.getCurrentResult().fetchStatus).toBe("idle");
    expect(getMovieDetail).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("상세는 30초 후 stale이어도 삭제·자동 요청되지 않고 재접근 시 조회한다", async () => {
    vi.useFakeTimers();
    const client = createClient();
    const detail = { id: 42, title: "테스트" } as Awaited<ReturnType<typeof getMovieDetail>>;
    vi.mocked(getMovieDetail).mockResolvedValue(detail);
    const options = movieQueries.detail(42);
    await client.fetchQuery(options);
    await vi.advanceTimersByTimeAsync(30_001);
    const cachedQuery = client.getQueryCache().find({ queryKey: options.queryKey });
    expect(cachedQuery?.isStaleByTime(options.staleTime)).toBe(true);
    expect(client.getQueryData(options.queryKey)).toEqual(detail);
    expect(getMovieDetail).toHaveBeenCalledTimes(1);
    await client.fetchQuery(options);
    expect(getMovieDetail).toHaveBeenCalledTimes(2);
  });

  it("공통 1분 후에는 재조회하고 inactive 캐시는 5분 후 정리한다", async () => {
    vi.useFakeTimers();
    const client = createClient();
    vi.mocked(getMovies).mockResolvedValue(listResponse(1));
    const options = movieQueries.list(1);
    await client.fetchQuery(options);
    await vi.advanceTimersByTimeAsync(60_001);
    expect(client.getQueryData(options.queryKey)).toBeDefined();
    await client.fetchQuery(options);
    expect(getMovies).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(5 * 60_000 + 1);
    expect(client.getQueryData(options.queryKey)).toBeUndefined();
  });

  it("실패 상태를 제공하고 수동 refetch로 복구한다", async () => {
    const client = createClient();
    vi.mocked(getMovies).mockRejectedValueOnce(new Error("HTTP failure")).mockResolvedValue(listResponse(1));
    await expect(client.fetchQuery({ ...movieQueries.list(1), retry: false })).rejects.toThrow("HTTP failure");
    expect(client.getQueryState(movieQueries.list(1).queryKey)?.status).toBe("error");
    const observer = new QueryObserver(client, { ...movieQueries.list(1), enabled: false });
    expect((await observer.refetch()).isSuccess).toBe(true);
    expect(getMovies).toHaveBeenCalledTimes(2);
    observer.destroy();
  });
});
