FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm@11.20.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install
COPY . .
EXPOSE 3001
CMD ["pnpm", "dev"]
