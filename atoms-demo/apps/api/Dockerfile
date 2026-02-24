# ==============================================================================
# [Stage 1] Builder
# ==============================================================================
FROM node:20-alpine AS builder

# 1. 작업 폴더 생성
WORKDIR /app

# 2. 패키지 매니저(pnpm) 설치
# Node.js 20에는 corepack이 내장되어 있어 pnpm을 쉽게 켤 수 있습니다.
RUN corepack enable && corepack prepare pnpm@latest --activate

# 3. 프로젝트 의존성 파일 복사 (전체 파일보다 먼저 복사해서 캐시 효율을 높임)
COPY package.json pnpm-lock.yaml ./

# 4. 의존성 설치 (패키지 다운로드)
RUN pnpm install --frozen-lockfile

# 5. 전체 소스 코드 복사
COPY . .

# 6. NestJS(API) 빌드 실행
# 결과물은 /app/dist/apps/api 경로에 생성됩니다.
RUN pnpm nx build api

# ==============================================================================
# [Stage 2] Runner
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# 1. 운영 환경(Production)으로 설정 (불필요한 개발 도구 제외)
ENV NODE_ENV production

# 2. Builder 단계에서 완성된 요리(dist)와 재료(node_modules)만 가져오기
# 이렇게 하면 소스 코드(src)나 잡다한 설정 파일은 이미지에 포함되지 않아 가벼워집니다.
COPY --from=builder /app/dist/apps/api ./dist
COPY --from=builder /app/node_modules ./node_modules

# 3. 서버 실행 포트 노출 (3333번)
EXPOSE 3333

# 4. 서버 실행 명령어
CMD ["node", "dist/main.js"]
