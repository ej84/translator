# 통역기 — 배포 가이드

## 파일 구조
```
interpreter-app/
├── api/
│   └── translate.js       ← Anthropic API 프록시 (서버)
├── public/
│   ├── index.html         ← 메인 앱
│   ├── manifest.json      ← PWA 설정
│   └── icons/             ← 아이콘 폴더 (아래 참고)
├── vercel.json            ← Vercel 배포 설정
└── README.md
```

---

## 1단계: Anthropic API 키 발급

1. https://console.anthropic.com 접속 → 회원가입
2. 좌측 메뉴 **API Keys** → **Create Key**
3. 키 복사 (`sk-ant-...` 형태)
4. 💰 처음엔 무료 크레딧 $5 제공. 개인 사용 기준 월 $1~2 이하

---

## 2단계: GitHub에 올리기

```bash
cd interpreter-app
git init
git add .
git commit -m "Initial commit"
# GitHub에서 새 repo 생성 후:
git remote add origin https://github.com/YOUR_USERNAME/interpreter-app.git
git push -u origin main
```

---

## 3단계: Vercel 배포

1. https://vercel.com 접속 → GitHub으로 로그인
2. **New Project** → GitHub repo 선택 → **Import**
3. **Environment Variables** 섹션에서:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (복사해둔 키)
4. **Deploy** 클릭

배포 완료 후 `https://your-app.vercel.app` URL이 생성됩니다.

---

## 4단계: 아이콘 만들기 (PWA 홈 화면 설치용)

`public/icons/` 폴더를 만들고 아이콘 2개를 넣어야 합니다:
- `icon-192.png` (192×192px)
- `icon-512.png` (512×512px)

### 무료 아이콘 생성 방법:
- https://favicon.io — 텍스트로 아이콘 생성 (ex: "통역" 글자)
- 생성 후 192px, 512px 사이즈로 저장

---

## 5단계: 어머니 폰에 설치 (iOS)

1. Safari로 배포된 URL 접속
2. 하단 공유 버튼(□↑) 탭
3. **홈 화면에 추가** 탭
4. 이름 확인 후 **추가**

→ 홈 화면에 앱 아이콘이 생깁니다!

---

## 사용 방법

1. 상단 탭 선택: **한국어로 말하기** 또는 **영어로 말하기**
2. 마이크 버튼 탭 → 말하기
3. 말하기 끝나면 자동으로:
   - 텍스트로 표시
   - 번역 결과 표시
   - 번역된 음성 자동 재생
4. **소리 재생** 버튼으로 다시 들을 수 있음
5. **복사** 버튼으로 클립보드에 복사

---

## 주의사항

- 반드시 **Chrome** 또는 **Safari** 사용 (Firefox는 Web Speech API 미지원)
- 마이크 권한 허용 필요
- HTTPS 환경에서만 마이크 작동 (Vercel 배포 후 자동 HTTPS)
