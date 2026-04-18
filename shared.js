// KSAN Platform — Shared JS
// 가짜 로그인 상태 관리 (sessionStorage 대신 변수 사용, 페이지 이동 시 URL 파라미터로 전달)

// URL 파라미터로 로그인 상태 읽기
function getAuthState() {
  const params = new URLSearchParams(window.location.search);
  return {
    isLoggedIn: params.get('auth') === '1',
    userType: params.get('type') || 'guest', // guest | student | alumni | admin
    userName: params.get('name') || ''
  };
}

// 링크에 auth 상태 유지시키기
function buildUrl(page, additionalParams = {}) {
  const auth = getAuthState();
  const params = new URLSearchParams();
  if (auth.isLoggedIn) {
    params.set('auth', '1');
    params.set('type', auth.userType);
    if (auth.userName) params.set('name', auth.userName);
  }
  Object.entries(additionalParams).forEach(([k, v]) => params.set(k, v));
  const queryString = params.toString();
  return queryString ? `${page}?${queryString}` : page;
}

// 페이지 로드 시 네비게이션 바 업데이트
function updateNav() {
  const auth = getAuthState();
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  if (auth.isLoggedIn) {
    const typeLabel = {
      student: '학생 회원',
      alumni: 'Alumni',
      admin: '관리자'
    }[auth.userType] || 'Guest';
    
    const badgeClass = auth.userType === 'alumni' ? 'alumni' : 
                       auth.userType === 'student' ? 'student' : 'guest';
    
    navActions.innerHTML = `
      <span class="user-badge ${badgeClass}">${typeLabel}</span>
      <a href="${buildUrl('mypage.html')}" class="btn btn-ghost">마이페이지</a>
      <a href="index.html" class="btn btn-outline" onclick="return confirm('로그아웃 하시겠습니까?')">로그아웃</a>
    `;
  } else {
    navActions.innerHTML = `
      <a href="login.html" class="btn btn-outline">로그인</a>
      <a href="signup.html" class="btn btn-primary">멤버십 가입</a>
    `;
  }

  // 모든 내부 링크에 auth 파라미터 유지
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#') && href.endsWith('.html') && !a.hasAttribute('data-no-auth')) {
      const [path, query] = href.split('?');
      const additionalParams = {};
      if (query) {
        new URLSearchParams(query).forEach((v, k) => {
          if (k !== 'auth' && k !== 'type' && k !== 'name') {
            additionalParams[k] = v;
          }
        });
      }
      a.setAttribute('href', buildUrl(path, additionalParams));
    }
  });
}

// 모달 열기/닫기
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// 접근 권한 체크 (특정 등급만 볼 수 있는 페이지에서 사용)
function checkAccess(requiredLevel) {
  const auth = getAuthState();
  const levels = { guest: 0, student: 1, alumni: 2, admin: 3 };
  const userLevel = auth.isLoggedIn ? levels[auth.userType] : -1;
  const required = levels[requiredLevel];
  return userLevel >= required;
}

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
});

// 로그인 시뮬레이션 (로그인 페이지에서 호출)
function simulateLogin(userType, userName) {
  const params = new URLSearchParams();
  params.set('auth', '1');
  params.set('type', userType);
  params.set('name', userName);
  window.location.href = `mypage.html?${params.toString()}`;
}
