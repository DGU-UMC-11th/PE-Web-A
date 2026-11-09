const API_BASE = 'http://localhost:8080';

for (const form of document.querySelectorAll('form')) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const kind = form.dataset.kind;
    const value = form.elements.value.value.trim();
    const status = document.getElementById(`${kind}-status`);
    const responseView = document.getElementById(`${kind}-response`);
    const button = form.querySelector('button');
    const list = document.getElementById('ratings-list');
    if (!value) {
      status.textContent = '값을 입력해 주세요.';
      status.dataset.error = 'true';
      return;
    }
    const path = kind === 'ratings'
      ? `/members/${encodeURIComponent(value)}/ratings`
      : `/members/${kind}/${encodeURIComponent(value)}`;
    const url = `${API_BASE}${path}`;
    button.disabled = true;
    status.dataset.error = 'false';
    status.textContent = '확인 중이에요…';
    responseView.textContent = `GET ${url}\n응답을 기다리는 중이에요.`;
    if (kind === 'ratings') list.replaceChildren();
    try {
      const response = await fetch(url);
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }
      responseView.textContent = `GET ${url}\nHTTP ${response.status}\n${data === null ? text : JSON.stringify(data, null, 2)}`;
      if (!response.ok) {
        throw new Error(response.status === 404 && kind === 'ratings'
          ? '존재하지 않는 회원이에요.' : `요청을 처리하지 못했어요. (HTTP ${response.status})`);
      }
      if (kind === 'ratings') {
        if (!Array.isArray(data)) throw new Error('평점 응답 형식을 확인해 주세요.');
        status.textContent = data.length ? `${value}번 회원의 평점 ${data.length}개 · 최신 등록순` : '아직 작성한 평점이 없어요.';
        for (const rating of data) {
          const item = document.createElement('li');
          const heading = document.createElement('strong');
          heading.textContent = `영화 #${rating.movieId} · ${rating.score} / 5점`;
          const comment = document.createElement('p');
          comment.textContent = rating.comment || '작성한 코멘트가 없어요.';
          const date = document.createElement('small');
          date.textContent = `등록: ${rating.createdAt} · 수정: ${rating.updatedAt}`;
          item.append(heading, comment, date);
          list.append(item);
        }
      } else {
        if (typeof data?.available !== 'boolean') throw new Error('중복 확인 응답 형식을 확인해 주세요.');
        const label = kind === 'nickname' ? '닉네임' : '이메일';
        status.textContent = data.available ? `사용 가능한 ${label}이에요.` : `이미 사용 중인 ${label}이에요.`;
      }
    } catch (error) {
      status.dataset.error = 'true';
      const message = error instanceof TypeError
        ? '서버에 연결하지 못했어요. 서버 실행 상태와 CORS 설정을 확인해 주세요.'
        : error.message;
      status.textContent = message;
      if (error instanceof TypeError) {
        responseView.textContent = `GET ${url}\n${message}`;
        console.error('API 연결 실패:', error);
      }
    } finally {
      button.disabled = false;
    }
  });
}
