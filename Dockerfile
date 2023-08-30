FROM --platform=linux/amd64 node:18.15.0

# Create app directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./
RUN yarn --pure-lockfile --production && yarn cache clean

# Copy rest of files
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 8080

# Start
CMD ["yarn", "start"]
