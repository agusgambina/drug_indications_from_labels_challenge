# Drug indications from labels challenge

## Node version

The node version is specified on `.nvmrc`, so it won't be documented in this file to avoid being outdated. If the information is more in one place, it will probably be inconsistent soon.

## Environment Setup

Before running the application, you need to set up your environment variables:

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open the `.env` file and fill in the required values:

   - OLLAMA settings:
     - `OLLAMA_PORT`: Port for the Ollama service

   - PostgreSQL settings:
     - `POSTGRES_DB`: Database name
     - `POSTGRES_USER`: Database user
     - `POSTGRES_PASSWORD`: Database password
     - `POSTGRES_PORT`: Database port

   - Application settings:
     - `APP_PORT`: Port where the application will run (default: 3000)

## Docker Compose

Make sure you have Docker and Docker Compose installed on your system.

### Production Mode

1. Build and start the containers:
```bash
npm run docker:up
```

2. Pull the required Ollama model:
```bash
docker exec -it ollama ollama pull llama2
```

3. The application will be available at `http://localhost:3000`

To stop the containers:
```bash
npm run docker:down
```

### Development Mode

The development environment includes additional features:
- Hot-reload enabled
- Source code mounted as a volume
- Development dependencies installed
- Watch mode for automatic recompilation

1. Start the development environment:
```bash
npm run docker:dev:up
```

2. The application will start in watch mode, automatically recompiling when you make changes to the code.

3. To stop the development environment:
```bash
npm run docker:dev:down
```

### Additional Commands
- View logs (production): `docker compose logs`
- View logs (development): `docker compose -f docker-compose.dev.yml logs -f`
- Build the application image: `npm run docker:build`
