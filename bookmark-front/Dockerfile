# Use Python image to serve static files
FROM python:3.11-slim

# Set working directory
WORKDIR /usr/src/app

# Copy frontend files
COPY . .

# Expose port 80 and run HTTP server
EXPOSE 80
CMD ["python", "-m", "http.server", "80"]

