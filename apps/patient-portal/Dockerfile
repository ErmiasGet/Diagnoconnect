# DiagnoConnect - Multi-stage Dockerfile for Patient Portal
FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/patient-portal/package*.json ./
RUN npm ci

COPY apps/patient-portal/ ./
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config
COPY apps/patient-portal/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
