# Build stage
FROM rust:latest as builder

WORKDIR /app

# Copy Cargo files
COPY Cargo.toml ./
COPY Cargo.loc[k] ./

# Copy source code
COPY src ./src

# Build the storage server binary
RUN cargo build --release --bin store-server --features server

# Runtime stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy the built binary from builder
COPY --from=builder /app/target/release/store-server .

# Create data directory for persistent storage
RUN mkdir -p /app/data

# Expose port (default 3020 for storage server)
EXPOSE 3020

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3020/health || exit 1

# Run the server on port 3020
CMD ["./store-server", "http://127.0.0.1:3020", "3020"]
