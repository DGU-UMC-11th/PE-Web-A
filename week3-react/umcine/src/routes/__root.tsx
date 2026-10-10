import { createRootRoute, Link } from '@tanstack/react-router';
import { AppLayout } from '../components/layout/app-layout';

export const Route = createRootRoute({
  component: AppLayout,
  notFoundComponent: () => <main className="mx-auto flex-1 p-16"><h1 className="mb-5 text-2xl font-bold">페이지를 찾을 수 없어요.</h1><Link to="/" className="text-[#4164ed]">영화 목록으로 돌아가기</Link></main>,
});
