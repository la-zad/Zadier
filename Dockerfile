FROM oven/bun:alpine as BUILDER

WORKDIR /builder

COPY . .

RUN bun install
RUN bun run build

#############################################
FROM oven/bun:alpine

USER nobody

WORKDIR /app

COPY --from=BUILDER /builder/out/index.js .

ARG TOKEN
ARG CLIENT_ID
ARG SERVER_ID

CMD ["bun", "index.js"]
