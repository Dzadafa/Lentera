FROM alpine:3.20

WORKDIR /pb

# Copy pre-downloaded PocketBase executable
COPY pocketbase /pb/pocketbase
RUN chmod +x /pb/pocketbase

EXPOSE 8090

VOLUME /pb/pb_data

ENTRYPOINT ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data", "--publicDir=/pb/pb_public", "--hooksDir=/pb/pb_hooks", "--migrationsDir=/pb/pb_migrations"]
