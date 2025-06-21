# Use official Node.js LTS image as base
FROM node:20-alpine

# Set working directory
WORKDIR /app

COPY .env /app/.env 
# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port (change if your app uses a different port)
EXPOSE 5001

# Start the application
CMD ["npm", "start"]