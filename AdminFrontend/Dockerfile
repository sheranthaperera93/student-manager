# Stage 1: Build the Angular app
FROM node:22 AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2: Serve the Angular app
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist/user-manager-fe/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]