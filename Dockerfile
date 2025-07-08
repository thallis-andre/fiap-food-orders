FROM node:20-alpine AS builder
ARG target=fiap-food-orders
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build ${target}

FROM node:20-alpine AS runtime
ARG target=fiap-food-orders
ENV PORT=3000
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist/apps/${target}/* ./dist/
EXPOSE ${PORT}
CMD ["node", "dist/main.js"]