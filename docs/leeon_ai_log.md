# Leeon AI Development Log: AI-Assisted Workflow & Collaboration

**작성자:** Leeon (Backend & Core Logic Lead)  
**담당 파트:** API Architecture, Authentication, Database Design, Map Integration, Test Automation, Refactoring  
**활용 도구:** VS Code Gemini CLI, ChatGPT-4o, Claude 3.5 Sonnet

---

## 1. AI 활용 방법론 (Development Workflow)

AI를 단순 코드 생성 도구가 아닌 **개발자 주도 설계 기반 보조 도구**로 활용한 개발 프로세스 적용.

**개발 흐름:** 설계(Human) → 구현(AI) → 검증(Review) → 통합(Refactoring)

1. **설계(Task Definition)**  
   figma를 활용하여 시스템 구조와 사용자 흐름을 명확히 정의하기 위해 프론트엔드, 백엔드, 외부 API, 테스트 대상 모듈 간의 관계를 하나의 아키텍처 다이어그램으로 설계 후    기능 요구사항 및 기술적 제약 조건의 Markdown 문서화. 이를 통해 기능 구현 이전 단계에서 데이터 흐름, API 책임 범위, 테스트 대상 모듈을 명확히 정의하여 이후 구현 및
   리팩토링 과정의 혼선을 최소화함.
   <img width="1440" height="792" alt="image" src="https://github.com/user-attachments/assets/ce17ba57-3973-47a5-87fd-9a9e6a1a4b47" />


3. **구현(Implementation)**  
   VS Code 내 Gemini CLI를 활용한 명세 기반 초안 코드 생성.

4. **검증(Quality Control)**  
   Claude 및 GPT를 활용한 로직 오류, 예외 처리, 보안 취약점 점검.

5. **통합 및 리팩토링(Integration)**  
   팀원 코드 병합 과정에서의 구조 개선 및 충돌 해결 수행.

---

## 2. 주요 구현 및 기여 (Core Implementations)

### (1) Backend & Database 구축

프론트엔드 개발 병목 제거를 위한 초기 백엔드 환경 구축.

- `users`, `schedules`, `attractions` 간 참조 무결성 기반 데이터 구조 설계.
- JSON Server 환경에 맞춘 테스트 데이터(`db.json`) 구성.
- 방콕 관광지 데이터(이미지, 설명 포함) 약 15건 AI 기반 생성.
- 프론트엔드 팀의 즉시 개발 착수를 위한 API 환경 제공.

---

### (2) 지도(Map) 기능 연동 및 성능 최적화

지도 기능 제공과 페이지 성능 저하 방지를 동시에 고려한 구조 설계.

- Google Maps iframe 초기 로딩으로 인한 성능 저하 문제 식별.
- 모달 오픈 시점에만 iframe `src`를 주입하는 지연 로딩(Lazy Loading) 구조 적용.
- 모달 종료 시 리소스 해제 처리.
- 사용자 입력 여행지 텍스트의 Google Maps Embed API 형식 자동 인코딩 로직 구현.

---

### (3) 공통 API 모듈 설계 (`api.js`)

인증 로직 표준화 및 중복 코드 제거를 위한 중앙 API 모듈 구축.

- Raw Fetch 방식으로 인한 토큰 누락 문제 식별.
- 토큰 자동 주입 및 401 에러 발생 시 로그아웃 처리 포함 API Wrapper 구현.
- 모든 API 호출의 공통 모듈 기반 통합.
- 비동기 처리 및 에러 핸들링 안정성 검증.

---

### (4) 인증 시스템 구현 (`auth.js`)

순수 JavaScript 환경에서의 JWT 기반 인증 로직 구성.

- 로그인 → 토큰 저장 → 사용자 정보 조회 → 페이지 리다이렉트 흐름 설계.
- 인증 상태 기반 페이지 접근 제어 로직 구현.
- 보안 취약점 점검을 통한 인증 흐름 안정화.

---

### (5) 테스트 자동화 (Test Automation – System Stability)

핵심 로직 전반의 안정성 확보 및 회귀 버그 사전 차단을 위한 테스트 구조 구축.

- 테스트 대상 모듈: `api.js`, `auth.js`, `scheduler.js`
- 오류 발생 빈도가 높은 스케줄러 로직 중심 테스트 우선 적용.

#### 테스트 구성 개요
- `api.test.js` : 공통 API Wrapper 동작 및 예외 처리 검증
- `auth.test.js` : 인증 흐름 및 토큰 처리 로직 검증
- `scheduler.test.js` : 일정 관리 핵심 로직 및 계산 정확도 검증

#### AI 활용

- **Environment Mocking**
  - Jest(Node.js) 환경에서 브라우저 전역 객체(`localStorage`, `fetch`) 사용 불가 문제 식별.
  - `jest.fn()` 기반 Mocking 코드 작성.
  - 네트워크 및 브라우저 의존성 제거된 테스트 환경 구성.

- **API Logic 검증 (`api.test.js`)**
  - 토큰 자동 주입 여부 검증.
  - 401 응답 발생 시 로그아웃 처리 로직 테스트.
  - Fetch Wrapper 에러 처리 흐름 안정성 검증.

- **Authentication Logic 검증 (`auth.test.js`)**
  - 로그인 성공 및 실패 케이스 분리 테스트.
  - 토큰 저장 및 사용자 정보 조회 흐름 검증.
  - 인증 상태 기반 리다이렉트 조건 검증.

- **Scheduler Logic 검증 (`scheduler.test.js`)**
  - 일정 관리 페이지(`scheduler.js`)에서 계산 오류 빈번 발생 문제 식별.
  - DOM 조작 제외 및 순수 로직 중심 단위 테스트 구조 설계.
  - 비용 계산(`totalCost`) 및 관광지 추가/삭제 로직 정확성 검증.
  - 기능 확장 시 회귀 버그 방지를 위한 안정성 확보.

---

## 3. 리팩토링 및 협업 기여 (Technical Leadership)

### (1) 지도 모달 UI 버그 수정

지도 모달 관련 UI 및 레이아웃 문제 해결.

- 지도 모달이 다른 UI 요소 뒤에 가려지는 문제 식별.
- CSS Stacking Context 분석 기반 `z-index` 재설정.
- iframe 로딩 전 레이아웃 붕괴 방지를 위한 스타일 보완.
- 지도 모달 시인성 및 UI 안정성 개선.

---

### (2) API 호출 구조 리팩토링

팀 내 API 호출 방식 일관성 확보.

- 팀원별 Raw Fetch 사용으로 인한 구조적 불일치 문제 식별.
- 공통 API 모듈(`api.js`) 기반 호출 구조로 전면 리팩토링.
- 하드코딩된 URL 및 중복 로직 제거.
- `scheduler.js` 등 핵심 파일 중심 코드 가독성 및 유지보수성 개선.

---

### (3) Git 충돌 해결 및 통합

공용 파일 병합 과정에서의 충돌 해결 주도.

- `style.css`, `home.js` 등 공용 파일 충돌 발생 문제 대응.
- 단순 덮어쓰기 방식 배제 및 양측 코드 의도 분석 기반 병합 수행.
- UI 및 기능 파손 상태 복구.
- 프로젝트 통합 안정성 확보.

---

## 4. 결론 (Summary)

개발자 주도 설계 기반 AI 활용을 통한 프로젝트 완성도 향상.

- 핵심 기능 설계 및 구조 결정의 직접 수행.
- AI 기반 구현 가속 및 검증 보조 활용.
- 지도 기능 성능 최적화, 인증 구조 정리, 테스트 자동화, 전반적 리팩토링 수행.
- 프로젝트 안정성, 유지보수성, 협업 효율성 개선에 대한 기여.
