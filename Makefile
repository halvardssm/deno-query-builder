DB_PG_PORT=5000
DB_MYSQL_PORT=5001
DB_USER=root
DB_PWD=pwd
DB_NAME=qb

test-all: test-qb test-db

# Tests the builder against strings
test-qb:
	deno test tests/qb
# Tests the queries against the databases to confirm the queries
test-db: db-all-restart
	deno test --allow-write --allow-read --allow-net tests/db

test-db-sqlite: db-sqlite-stop db-sqlite-start
	deno test --allow-write --allow-read tests/db/sqlite.test.ts
test-db-mysql: db-mysql-stop db-mysql-start
	deno test --allow-net --unstable tests/db/mysql.test.ts
test-db-pg: db-pg-stop db-pg-start
	deno test --allow-net --unstable tests/db/pg.test.ts

db-all-restart: db-all-stop db-all-start
db-all-start: db-sqlite-start db-pg-start db-mysql-start
db-all-stop: db-sqlite-stop db-pg-stop db-mysql-stop

db-pg-start:
	docker run -d --rm \
	-p $(DB_PG_PORT):5432 \
	-e POSTGRES_USER=$(DB_USER) \
	-e POSTGRES_PASSWORD=$(DB_PWD) \
	-e POSTGRES_DB=${DB_NAME} \
	-v `pwd`/data/pg:/var/lib/postgresql/data \
	--name $(DB_NAME)-pg \
	--health-cmd pg_isready \
	--health-interval 10s \
	--health-timeout 5s \
	--health-retries 5 \
	postgres:latest
	while [ "`docker inspect -f {{.State.Health.Status}} $(DB_NAME)-pg`" != "healthy" ]; do sleep 10; done

db-pg-stop:
	docker kill ${DB_NAME}-pg | true
	rm -rf data/pg

db-mysql-start:
	# docker run -d -p $(DB_MYSQL_PORT):3306 -e MYSQL_ROOT_PASSWORD=$(DB_PWD) -e MYSQL_DATABASE=${DB_NAME} -v `pwd`/tests/data/mysql:/var/lib/mysql --rm --name $(DB_NAME)-mysql mysql:5
	docker run -d --rm \
	-p $(DB_MYSQL_PORT):3306 \
	-e MYSQL_ALLOW_EMPTY_PASSWORD=true \
	-e MYSQL_DATABASE=${DB_NAME} \
	-v `pwd`/data/mysql:/var/lib/mysql \
	--name $(DB_NAME)-mysql \
	--health-cmd "mysqladmin ping" \
	--health-interval 10s \
	--health-timeout 5s \
	--health-retries 5 \
	mysql:latest
	while [ "`docker inspect -f {{.State.Health.Status}} $(DB_NAME)-mysql`" != "healthy" ]; do sleep 10; done
db-mysql-stop:
	docker kill ${DB_NAME}-mysql | true
	rm -rf data/mysql

db-sqlite-start:
	mkdir -p data && touch data/sqlite.db
db-sqlite-stop:
	rm -rf data/sqlite.db