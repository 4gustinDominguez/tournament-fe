FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@11.20.0
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
RUN npm install -g pnpm@11.20.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./next.config.mjs
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3001
CMD ["pnpm", "start"]
