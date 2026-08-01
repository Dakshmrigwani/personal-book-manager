# Express TypeScript Boilerplate

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Contributions](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)

## Overview

A robust boilerplate for rapidly building production-ready RESTful APIs with Node.js, Express, and Mongoose.

Spin up a fully configured, scalable Node.js app with a single command — ready for development and deployment out of the box. This starter includes everything you need: JWT-based authentication, request validation, Docker support, pagination utilities, and more.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Mongoose** - Object Data Modeling (ODM)
- **MongoDB** - NOSQL database
- **Docker** - Containerized environment
- **pnpm** - Fast, disk-efficient package manager

## Folder Structure

```plaintext
├── .husky/                # Git hooks configuration
├── .vscode/               # VS Code workspace settings
├── generators/            # Custom code generators (Plop)
├── public/                # Static assets
├── scripts/               # Automation & utility scripts
├── src/                   # Application source code
│   ├── config/            # App configuration files
│   ├── controllers/       # Request & response handlers
│   ├── docs/              # API documentation
│   ├── middlewares/       # Express middlewares
│   ├── models/            # Mongoose models (DB schemas)
│   ├── routes/            # API routes
│   ├── services/          # Business logic & reusable services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions & helpers
│   ├── validations/       # Request schema validations
│   ├── app.ts             # Express app configuration
│   ├── index.ts           # Server entry point
├── tests/                 # Unit & integration tests
├── .dockerignore          # Docker ignore rules
├── .env.example           # Example environment config
├── .gitignore             # Git ignore rules
├── biome.json             # Biome (linter/formatter) config
├── docker-compose.yml     # Docker Compose setup
├── Dockerfile             # Docker image build instructions
├── ecosystem.config.json  # PM2 process manager config
├── package.json           # Project metadata & scripts
├── plopfile.js            # Plop generator config
├── pnpm-lock.yaml         # Dependency lock file (PNPM)
├── tsconfig.json          # TypeScript compiler configuration
```

## Installation

### Quick Start

To create a project, simply run:

```bash
npx get-express-starter
```

### Manual Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/logicalHassan/nodets-express-boilerplate.git
   cd nodets-express-boilerplate
   ```

2. Install dependencies:
  
   ```sh
   pnpm install // PNPM is recommended
   ```

3. Configure environment variables:

   ```sh
   cp .env.example .env
   ```

4. Start the development server:

   ```sh
   pnpm run dev
   ```

## Commands

### Development

| Command               | Description                                      |
|-----------------------|--------------------------------------------------|
| `pnpm run dev`        | Start the development server with live reload    |
| `pnpm run start:dev`  | Compile TypeScript and run the server in dev mode |
| `pnpm run clean`      | Remove the build output (`dist/` folder)         |

---

### Build & Production

| Command               | Description                                      |
|-----------------------|--------------------------------------------------|
| `pnpm run build`      | Type-check and compile the project               |
| `pnpm start`          | Start the server using PM2 in production mode    |

---

### Linting & Formatting

| Command               | Description                                      |
|-----------------------|--------------------------------------------------|
| `pnpm run lint`       | Lint all source files with Biome                 |
| `pnpm run lint:fix`   | Lint and auto-fix issues                         |
| `pnpm run format`     | Format source files using Biome                  |

---

### Scripts & Utilities

| Command               | Description                                      |
|-----------------------|--------------------------------------------------|
| `pnpm run seed:admin` | Seed the database with an admin user             |
| `pnpm run generate`   | Generate boilerplate code using Plop             |
| `pnpm run prepare`    | Setup Husky Git hooks                            |

## Running with Docker

```sh
docker compose up --build
```

This will spin up MongoDB and the application container but make sure your code have the required files that compose files needs such as `.env.production`

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`feature/your-feature-name`).
3. Commit your changes with meaningful messages.
4. Open a pull request.

## License

This project is licensed under the [MIT](LICENSE) License.
