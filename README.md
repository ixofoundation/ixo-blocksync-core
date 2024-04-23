# ixo-blocksync-core

[![ixo](https://img.shields.io/badge/ixo-project-blue)](https://ixo.foundation)
[![GitHub](https://img.shields.io/github/stars/ixofoundation/jambo?style=social)](https://github.com/ixofoundation/ixo-blocksync-core)
![GitHub repo size](https://img.shields.io/github/repo-size/ixofoundation/ixo-blocksync-core)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/ixofoundation/jambo/blob/main/LICENSE)

[![Twitter](https://img.shields.io/twitter/follow/ixo_impact?style=social)](https://twitter.com/ixoworld)
[![Medium](https://img.shields.io/badge/Medium-ixo-green)](https://ixoworld.medium.com/)

![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)

Syncs the core info from an ixo blockchain to an instance of PostgreSQL. The core info consists of the Block data, Transactions, Messages and Events.

> For now this server doesnt expose any API interfaces as it's purpose is only to generate and keep up to date the ixo-blocksync-core database, we plan on adding API interfaces in the near future

## Run

### From Source

Requirements

- [PostgreSQL](https://www.postgresql.org/download/)

```bash
git clone https://github.com/ixofoundation/ixo-blocksync-core.git
cd ixo-blocksync-core/
```

Copy `.env.example` to `.env` and configure. If this step is skipped, ixo-blocksync-core will use `.env.example` as the configuration by default.

- Create a database called Blocksync-core

```bash
yarn install
yarn start
```

---

### Using Docker (with Compose)

Requirements

- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/ixofoundation/ixo-blocksync-core.git
cd ixo-blocksync-core/
```

Copy `.env.example` to `.env` and configure. If this step is skipped, ixo-blocksync will use `.env.example` as the configuration by default.
Don't use quotations when asign env vars for docker  
Create a role(e.g. app_user) in the DB for postgress to work

```bash
docker build -t ixofoundation/ixo-blocksync-core:latest .
docker compose up -d
```
