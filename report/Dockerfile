FROM nginx:1.22-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 8082
CMD ["nginx", "-g", "daemon off;"]