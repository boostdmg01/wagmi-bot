ARG NGINX_VER=1.23.0

FROM nginx:${NGINX_VER}-alpine as base

ARG MODSEC_TAG=v3.0.7
ARG OWASP_TAG=v3.3.2

WORKDIR /opt

RUN apk add --no-cache --virtual general-dependencies \
    autoconf \
    automake \
    byacc \
    curl-dev \
    flex \
    g++ \
    gcc \
    geoip-dev \
    git \
    libc-dev \
    libmaxminddb-dev \
    libstdc++ \
    libtool \
    libxml2-dev \
    linux-headers \
    lmdb-dev \
    make \
    openssl-dev \
    pcre-dev \
    yajl-dev \
    zlib-dev

RUN git clone -b ${MODSEC_TAG} --depth 1 https://github.com/SpiderLabs/ModSecurity.git && \
    git -C /opt/ModSecurity submodule update --init --recursive && \
    (cd "/opt/ModSecurity" && \
        ./build.sh && \
        ./configure && \
        make && \
        make install \
    ) && \
    rm -fr /opt/ModSecurity \
        /usr/local/modsecurity/lib/libmodsecurity.a \
        /usr/local/modsecurity/lib/libmodsecurity.la

RUN git clone -b master --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git && \
    git clone -b ${OWASP_TAG} --depth 1 https://github.com/coreruleset/coreruleset.git /usr/local/owasp-modsecurity-crs && \
    wget -O - https://nginx.org/download/nginx-$NGINX_VERSION.tar.gz | tar -xz

RUN (cd "/opt/nginx-$NGINX_VERSION" && \
        ./configure --with-compat \
            --add-dynamic-module=../ModSecurity-nginx && \
        make modules \
    ) && \
    cp /opt/nginx-$NGINX_VERSION/objs/ngx_http_modsecurity_module.so \
        /usr/lib/nginx/modules/ && \
    rm -fr /opt/* && \
    apk del general-dependencies


FROM nginx:${NGINX_VER}-alpine as production

COPY --from=base /etc/nginx/ /etc/nginx/
COPY --from=base /usr/local/modsecurity /usr/local/modsecurity
COPY --from=base /usr/local/owasp-modsecurity-crs /usr/local/owasp-modsecurity-crs
COPY --from=base /usr/lib/nginx/modules/ /usr/lib/nginx/modules/

COPY conf/nginx/ /etc/nginx/
COPY conf/modsec/ /etc/nginx/modsec/
COPY conf/owasp/ /usr/local/owasp-modsecurity-crs/

RUN apk add --no-cache \
    curl-dev \
    libmaxminddb-dev \
    libstdc++ \
    libxml2-dev \
    lmdb-dev \
    pcre \
    tzdata \
    yajl

EXPOSE 8082
CMD ["nginx", "-g", "daemon off;"]