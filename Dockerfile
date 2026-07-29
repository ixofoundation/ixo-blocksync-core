FROM --platform=linux/amd64 node:22-trixie-slim

# The npm bundled with the base image ships a vulnerable node-tar
# (CVE-2026-59873); npm 12 bundles the fixed tar >=7.5.19. Same fix as
# ixo-blocksync — without it the shared Trivy CRITICAL gate fails the build.
RUN npm install -g npm@12 && npm cache clean --force

# Create app directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./
RUN yarn --pure-lockfile --production && yarn cache clean

# Copy rest of files
COPY . .

EXPOSE 8080

# Start
CMD ["yarn", "start"]
