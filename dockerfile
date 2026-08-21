# syntax=docker/dockerfile:1

FROM node:24-alpine

WORKDIR /app

# -----------------------------
# Root Dependencies
# -----------------------------
COPY package*.json ./

RUN if [ -f package-lock.json ]; then \
  npm ci; \
  else \
  npm install; \
  fi

# -----------------------------
# Client Dependencies
# -----------------------------
COPY client/package*.json ./client/

RUN if [ -f client/package-lock.json ]; then \
  npm ci --prefix client; \
  else \
  npm install --prefix client; \
  fi

# -----------------------------
# Server Dependencies
# -----------------------------
COPY server/package*.json ./server/

RUN if [ -f server/package-lock.json ]; then \
  npm ci --prefix server; \
  else \
  npm install --prefix server; \
  fi

# -----------------------------
# Application
# -----------------------------
COPY . .

RUN mkdir -p server/uploads

EXPOSE 3000
EXPOSE 5173

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]
