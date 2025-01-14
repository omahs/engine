.PHONY: build

SHELL := /bin/bash

export NODE_ENV=testing
export POSTGRES_HOST=localhost
export POSTGRES_DATABASE_NAME=postgres
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export POSTGRES_PORT=5432
export POSTGRES_USE_SSL=false
# export THIRDWEB_API_SECRET_KEY=klRsqmatrdlEpik_pHKgYy_q2YzGe3bTewO1VC26eY_H184Kc7xOVqKVj0mHwOOW2AOx2N-a3GqLCQ7Z9s9-sw

test-evm: FORCE
	docker compose -f docker-compose-test.yml up -d
	./test/e2e/hardhat/waitForHardhatNode.sh
	yarn prisma:migrate
	yarn test:all
	docker compose -f docker-compose-test.yml down

FORCE: ;
