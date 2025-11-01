ARG NODE_VERSION=24.20.0

# ---------- Builder Stage ----------
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/src/brickchain-api

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# Remove devDependencies after build to reduce image size
RUN npm prune --production

# ---------- Production Stage ----------
FROM node:${NODE_VERSION}-alpine AS production

# Install tzdata for time zone support
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Kolkata /etc/localtime && \
    echo "Asia/Kolkata" > /etc/timezone && \
    apk del tzdata

WORKDIR /usr/src/brickchain-api

ENV TZ=Asia/Kolkata

EXPOSE 3000

COPY --from=builder /usr/src/brickchain-api/node_modules ./node_modules
COPY --from=builder /usr/src/brickchain-api/generated ./generated
COPY --from=builder /usr/src/brickchain-api/dist ./dist
COPY --from=builder /usr/src/brickchain-api/package*.json ./
COPY --from=builder /usr/src/brickchain-api/.env ./

CMD ["npm", "run","start"]