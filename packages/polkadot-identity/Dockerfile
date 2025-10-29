# Build stage
FROM rust:1.75 as builder

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Build the application
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd -m -u 1001 appuser

WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/target/release/polkadot-identity /app/polkadot-identity

# Change ownership to app user
RUN chown -R appuser:appuser /app
USER appuser

# Expose port (if you add a web server later)
EXPOSE 8080

# Run the application
CMD ["./polkadot-identity"]