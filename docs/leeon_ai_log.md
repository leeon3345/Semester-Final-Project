# P-A-S Summery

1. 아키텍처 설계
[Problem] 순수 HTML/JS 환경에서 로그인 구현과 DB 저장이 불가능함.

[AI Question] "스프링 없이 순수 JS로 로그인과 데이터 저장을 구현하려면 어떤 백엔드 구조가 좋아?"

[Solution] Node.js 기반의 json-server와 json-server-auth 미들웨어를 사용하여 가상 REST API 서버 구축 결정.

2. DB 모델링
[Problem] 여행 일정과 사용자 정보를 연결하는 JSON 데이터 구조 설계가 막막함.

[AI Question] "사용자별 여행 일정을 저장할 수 있는 db.json 스키마(구조)를 짜줘."

[Solution] users, attractions, schedules 3개 컬렉션 설계 및 userId를 이용한 관계형 구조 도입.

3. 기획 검증
[Problem] 와이어프레임 작성 후, 개발 단계에서 누락된 기능이 없을지 우려됨.

[AI Question] "내 와이어프레임 이미지들을 보고, 개발 시 필요한 필수 버튼이나 로직이 빠진 게 있는지 체크해줘."

[Solution] 스케줄러 페이지의 '저장 버튼' 누락과 '로그아웃' 버튼 필요성 확인 후 UI에 추가.

4. 협업 환경 구축
[Problem] 4인 팀 프로젝트 시 파일 충돌을 방지할 폴더 구조 필요.

[AI Question] "백엔드(본인)와 프론트(팀원)가 섞이지 않게 폴더 구조를 나누고 싶어."

[Solution] backend/, frontend/, docs/ 3단 분리 구조 채택 및 .gitignore 설정 적용.

5. 실행 자동화
[Problem] 폴더가 분리되어 서버 실행 명령어가 복잡해짐.

[AI Question] "backend 폴더의 db를 쓰면서 frontend 폴더를 정적 호스팅하는 package.json 스크립트 짜줘."

[Solution] npm start 명령어 하나로 통합 실행되도록 스크립트 작성 (json-server-auth ... --static frontend).

6. 오류 해결 (PowerShell)
[Problem] npm install 시 윈도우 보안 오류(PSSecurityException) 발생.

[AI Question] "VS Code 터미널에서 보안 오류로 npm이 실행 안 되는데 해결법이 뭐야?"

[Solution] Set-ExecutionPolicy RemoteSigned -Scope CurrentUser 명령어로 실행 권한 허용하여 해결.

7. 오류 해결 (Vulnerabilities)
[Problem] 패키지 설치 후 취약점 경고(2 vulnerabilities)가 떠서 불안함.

[AI Question] "npm install 후 뜨는 취약점 경고 메시지가 위험한 거야?"

[Solution] 로컬 개발 환경에서는 무시해도 되는 수준임을 확인하고 개발 진행.