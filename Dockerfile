FROM oven/bun:alpine as BUILDER

WORKDIR /builder

COPY . .

RUN bun install
RUN bun build ./src/index.ts --outdir ./out --target node

#############################################
FROM node:alpine

USER nobody

WORKDIR /app

COPY --from=BUILDER /builder/out/index.js ./index.mjs

ARG TOKEN
ARG CLIENT_ID
ARG SERVER_ID
ARG REPLICATE_TOKEN

CMD ["node", "index.mjs"]
