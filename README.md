# 한국어 단일 페이지 앱 (Korean SPA)

현대적이고 반응형인 한국어 단일 페이지 애플리케이션입니다.

## 📋 프로젝트 구조

```
C:\test\
├── package.json          # 프로젝트 설정 및 의존성 관리
├── server.js             # Express 정적 서버 (포트 5173)
├── README.md             # 프로젝트 문서 (이 파일)
└── public/               # 웹 리소스 폴더
    ├── index.html        # 메인 HTML 파일 (한국어 UI)
    └── assets/           # 아이콘, 이미지 등의 정적 리소스
```

## 🚀 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 서버 실행
```bash
npm start
```

서버가 성공적으로 시작되면 콘솔에 다음과 같은 메시지가 표시됩니다:
```
서버가 http://localhost:5173에서 실행 중입니다
```

### 3. 브라우저에서 접속
웹 브라우저를 열고 다음 주소로 이동하세요:
```
http://localhost:5173
```

## 🌟 주요 기능

- **한국어 UI**: 모든 인터페이스가 한국어로 구성
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 환경 지원
- **CDN 최적화**: Bootstrap, Font Awesome 등 CDN을 통한 빠른 로딩
- **인터랙티브 요소**: 실시간 시계, 알림 시스템, 호버 효과
- **현대적 스타일**: 그라디언트 배경, 카드 UI, 애니메이션 효과

## 🛠 기술 스택

### 백엔드
- **Node.js**: JavaScript 런타임
- **Express.js**: 웹 서버 프레임워크

### 프론트엔드
- **HTML5**: 웹 페이지 구조
- **CSS3**: 스타일링 및 애니메이션
- **Vanilla JavaScript**: 인터랙션 로직
- **Bootstrap 5**: UI 프레임워크 (CDN)
- **Font Awesome**: 아이콘 라이브러리 (CDN)

## 📱 지원 브라우저

- Chrome (권장)
- Firefox
- Safari
- Edge
- 기타 모던 브라우저

## 🎨 커스터마이징

### 스타일 변경
`public/index.html` 파일의 `<style>` 태그 내에서 CSS를 수정하여 디자인을 변경할 수 있습니다.

### 기능 추가
`public/index.html` 파일의 `<script>` 태그 내에서 JavaScript 코드를 추가하여 새로운 기능을 구현할 수 있습니다.

### 정적 리소스 추가
`public/assets/` 폴더에 이미지, 아이콘 등의 정적 파일을 추가할 수 있습니다.

## 🔧 개발자 도구

브라우저 개발자 도구(F12)의 콘솔에서 다음 유틸리티를 사용할 수 있습니다:

```javascript
// 시간 업데이트
window.debugUtils.showTime();

// 알림 표시
window.debugUtils.notify('메시지', 'success');

// 페이지 이동 시뮬레이션
window.debugUtils.navigate('/about');

// 앱 상태 확인
window.debugUtils.state;
```

## 📝 개발 노트

- 포트 5173은 Vite 개발 서버의 기본 포트를 사용
- SPA 라우팅을 위해 모든 경로가 `index.html`로 리디렉션됨
- 한국 시간대(Asia/Seoul) 기준으로 시계 표시
- 모든 주석은 한국어로 작성되어 있어 학습 및 이해에 도움

## 🤝 기여 방법

1. 프로젝트를 포크합니다
2. 새 기능을 위한 브랜치를 생성합니다
3. 변경사항을 커밋합니다
4. 브랜치에 푸시합니다
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 ISC 라이선스 하에 배포됩니다.

---

**즐거운 개발 되세요! 🎉**