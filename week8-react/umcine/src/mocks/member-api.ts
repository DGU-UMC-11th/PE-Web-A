/** 개발 화면 확인용 모의 API. 실제 인증·서버 저장을 제공하지 않는다. */
interface Member { memberId: number; email: string; nickname: string; passwordHash: string; createdAt: string }
interface Rating { ratingId: number; memberId: number; movieId: number; score: number; comment: string; createdAt: string; updatedAt: string }
interface Database {
  members: Member[];
  favorites: { memberId: number; movieId: number }[];
  ratings: Rating[];
  sessions: Record<string, number>;
  nextMemberId: number;
  nextRatingId: number;
}
const key = 'umcine-mock-api-v1';

/** 모의 계정의 비밀번호 원문을 저장하지 않기 위한 비교값이다. 실제 비밀번호 보안 구현은 아니다. */
async function hash(password: string) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
}

/** 새로고침 뒤에도 테스트 데이터를 유지하고, 처음에는 테스트 계정을 제공한다. */
async function loadDatabase(): Promise<Database> {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const db = JSON.parse(saved) as Database;
      if (Array.isArray(db.members) && Array.isArray(db.ratings) && Array.isArray(db.favorites) && db.sessions && Number.isInteger(db.nextMemberId) && Number.isInteger(db.nextRatingId)) return db;
    } catch { /* 손상된 개발 데이터는 초기화한다. */ }
  }
  return { members: [{ memberId: 1, email: 'demo@umcine.test', nickname: '영화팬', passwordHash: await hash('Umcine!1234'), createdAt: new Date().toISOString() }], favorites: [], ratings: [], sessions: {}, nextMemberId: 2, nextRatingId: 1 };
}

/** 실제 API와 같은 상태 코드와 응답 봉투를 반환한다. */
function reply(status: number, result: unknown = null, message = '요청을 처리했어요.') {
  if (status === 204) return new Response(null, { status });
  return Response.json({ isSuccess: status < 400, code: `COMMON${status}`, message, result }, { status });
}

/** 프로필 응답에는 비밀번호 비교값을 포함하지 않는다. */
function profile(member: Member) {
  return { memberId: member.memberId, email: member.email, nickname: member.nickname, createdAt: member.createdAt };
}

// 동시에 시작한 모의 요청도 같은 데이터를 순서대로 읽고 저장한다.
let queue: Promise<unknown> = Promise.resolve();
/** ky의 fetch만 대체한다. 인증 헤더·오류 처리·React Query 흐름은 실제 요청과 동일하다. */
export const mockFetch: typeof fetch = (input, init) => {
  const request = new Request(input, init);
  const task = queue.then(async () => {
    request.signal.throwIfAborted();
    const response = await handle(request);
    request.signal.throwIfAborted();
    return response;
  });
  queue = task.catch(() => undefined);
  return task;
};

/** 회원·즐겨찾기·평점 요청을 브라우저의 개발 데이터에 반영한다. */
async function handle(request: Request): Promise<Response> {
  const db = await loadDatabase();
  const path = decodeURIComponent(new URL(request.url).pathname).replace(/\/$/, '');
  const method = request.method;
  let body: Record<string, unknown> = {};
  if (method === 'POST' || method === 'PATCH') {
    try { body = await request.json(); } catch { return reply(400, null, '요청 JSON을 확인해 주세요.'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return reply(400, null, '요청 값을 확인해 주세요.');
  }
  const save = (response: Response) => { localStorage.setItem(key, JSON.stringify(db)); return response; };
  const check = path.match(/^\/members\/(email|nickname)\/(.+)$/);
  if (method === 'GET' && check) return reply(200, { available: !db.members.some(member => member[check[1] as 'email' | 'nickname'] === check[2]) });
  if (path === '/members' && method === 'POST') {
    const { email, nickname, password } = body;
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof nickname !== 'string' || nickname.trim().length < 2 || nickname.trim().length > 12 || typeof password !== 'string' || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password)) return reply(400, null, '이메일·닉네임·비밀번호 입력 조건을 확인해 주세요.');
    if (db.members.some(member => member.email === email || member.nickname === nickname.trim())) return reply(409, null, '이미 사용 중인 이메일 또는 닉네임이에요.');
    const member = { memberId: db.nextMemberId++, email, nickname: nickname.trim(), passwordHash: await hash(password), createdAt: new Date().toISOString() };
    db.members.push(member);
    return save(reply(201, profile(member), '회원가입이 완료됐어요.'));
  }
  if (path === '/auth/login' && method === 'POST') {
    const member = db.members.find(member => member.email === body.email);
    if (!member || typeof body.password !== 'string' || member.passwordHash !== await hash(body.password)) return reply(401, null, '이메일 또는 비밀번호가 올바르지 않아요.');
    const accessToken = `mock-${crypto.randomUUID()}`;
    db.sessions[accessToken] = member.memberId;
    return save(reply(200, { nickname: member.nickname, accessToken }));
  }
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '';
  const member = db.members.find(member => member.memberId === db.sessions[token]);
  if (!member) return reply(401, null, '로그인이 필요해요.');
  if (path === '/members/me') {
    if (method === 'GET') return reply(200, profile(member));
    if (method === 'PATCH') {
      const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : '';
      if (nickname.length < 2 || nickname.length > 12) return reply(400, null, '닉네임은 2~12자로 입력해 주세요.');
      if (db.members.some(other => other.memberId !== member.memberId && other.nickname === nickname)) return reply(409, null, '이미 사용 중인 닉네임이에요.');
      member.nickname = nickname;
      return save(reply(200, profile(member)));
    }
  }
  if (path === '/favorites') {
    if (method === 'GET') return reply(200, db.favorites.filter(item => item.memberId === member.memberId));
    if (method === 'POST') {
      if (!Number.isSafeInteger(body.movieId) || Number(body.movieId) <= 0) return reply(400, null, '영화 번호를 확인해 주세요.');
      if (db.favorites.some(item => item.memberId === member.memberId && item.movieId === body.movieId)) return reply(409, null, '이미 북마크한 영화예요.');
      const favorite = { memberId: member.memberId, movieId: Number(body.movieId) };
      db.favorites.push(favorite);
      return save(reply(201, favorite));
    }
  }
  const favoriteMatch = path.match(/^\/favorites\/(\d+)$/);
  if (favoriteMatch) {
    const movieId = Number(favoriteMatch[1]);
    if (method === 'GET') return reply(200, { isFavorite: db.favorites.some(item => item.memberId === member.memberId && item.movieId === movieId) });
    if (method === 'DELETE') {
      db.favorites = db.favorites.filter(item => item.memberId !== member.memberId || item.movieId !== movieId);
      return save(reply(204));
    }
  }
  const listMatch = path.match(/^\/members\/(\d+)\/ratings$/);
  if (method === 'GET' && listMatch) {
    const memberId = Number(listMatch[1]);
    if (!db.members.some(item => item.memberId === memberId)) return reply(404, null, '존재하지 않는 회원이에요.');
    return reply(200, db.ratings.filter(item => item.memberId === memberId).sort((a, b) => b.ratingId - a.ratingId));
  }
  const ratingMatch = path.match(/^\/ratings\/(\d+)$/);
  if ((path === '/ratings' && method === 'POST') || (ratingMatch && method === 'PATCH')) {
    if (!Number.isInteger(body.score) || Number(body.score) < 1 || Number(body.score) > 5 || (body.comment !== undefined && (typeof body.comment !== 'string' || body.comment.length > 500))) return reply(400, null, '별점은 1~5점, 후기는 500자 이하로 입력해 주세요.');
    if (method === 'POST') {
      if (!Number.isSafeInteger(body.movieId) || Number(body.movieId) <= 0) return reply(400, null, '영화 번호를 확인해 주세요.');
      if (db.ratings.some(item => item.memberId === member.memberId && item.movieId === body.movieId)) return reply(409, null, '이미 이 영화에 평점을 남겼어요.');
      const now = new Date().toISOString();
      const rating = { ratingId: db.nextRatingId++, memberId: member.memberId, movieId: Number(body.movieId), score: Number(body.score), comment: String(body.comment ?? ''), createdAt: now, updatedAt: now };
      db.ratings.push(rating);
      return save(reply(201, rating.ratingId));
    }
  }
  if (ratingMatch && (method === 'PATCH' || method === 'DELETE')) {
    const rating = db.ratings.find(item => item.ratingId === Number(ratingMatch[1]));
    if (!rating) return reply(404, null, '존재하지 않는 평점이에요.');
    if (rating.memberId !== member.memberId) return reply(403, null, '본인의 평점만 변경할 수 있어요.');
    if (method === 'DELETE') {
      db.ratings = db.ratings.filter(item => item.ratingId !== rating.ratingId);
      return save(reply(204));
    }
    rating.score = Number(body.score);
    rating.comment = String(body.comment ?? '');
    rating.updatedAt = new Date().toISOString();
    return save(reply(200));
  }
  return reply(404, null, '지원하지 않는 모의 API 경로예요.');
}
