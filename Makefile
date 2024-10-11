default: help

COLOR_WARNING = \033[31m
RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))

help: # Shows help for each of the Makefile recipes.
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m:$$(echo $$l | cut -f 2- -d'#')\n"; done
.PHONY: help

magic: # Init project
	$(MAKE) build
	$(MAKE) up
.PHONY: magic

build: # Build docker image
	docker compose build
.PHONY: build

restart: # Restart docker container
	$(MAKE) down
	$(MAKE) up
.PHONY: restart

up: # Up docker container
	docker compose up -d
.PHONY: up

down: # Down docker container
	docker compose down -t0
.PHONY: down

bash: # Opens terminal inside app container.
	docker compose exec -it jrm-draggable sh
.PHONY: bash

pre-commit: # Run quality checks.
	docker compose exec jrm-draggable sh -c "npm run lint:fix"
	docker compose exec jrm-draggable sh -c "npm run typecheck"
.PHONY: pre-commit

%:
	@:
