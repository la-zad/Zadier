FROM oven/bun:alpine as BUILDER

WORKDIR /builder

COPY . .

RUN bun run build

#############################################
FROM oven/bun:alpine

WORKDIR /app

COPY --from=BUILDER /builder/out/index.js .

ARG TOKEN
ARG CLIENT_ID

CMD ["bun", "index.js"]
