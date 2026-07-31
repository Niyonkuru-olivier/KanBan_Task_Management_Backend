import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "email" character varying(150) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "role" character varying(50) DEFAULT 'member',
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      );
    `);

    // 2. Workspaces table
    await queryRunner.query(`
      CREATE TABLE "workspaces" (
        "id" SERIAL NOT NULL,
        "name" character varying(150) NOT NULL,
        "owner_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_workspaces" PRIMARY KEY ("id"),
        CONSTRAINT "FK_workspaces_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // 3. Boards table
    await queryRunner.query(`
      CREATE TABLE "boards" (
        "id" SERIAL NOT NULL,
        "title" character varying(150) NOT NULL,
        "workspace_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_boards" PRIMARY KEY ("id"),
        CONSTRAINT "FK_boards_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
      );
    `);

    // 4. Columns table
    await queryRunner.query(`
      CREATE TABLE "columns" (
        "id" SERIAL NOT NULL,
        "title" character varying(100) NOT NULL,
        "position" integer NOT NULL,
        "board_id" integer NOT NULL,
        CONSTRAINT "PK_columns" PRIMARY KEY ("id"),
        CONSTRAINT "FK_columns_board" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE
      );
    `);

    // 5. Tasks table
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" SERIAL NOT NULL,
        "title" character varying(150) NOT NULL,
        "description" text,
        "column_id" integer NOT NULL,
        "assignee_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_tasks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tasks_column" FOREIGN KEY ("column_id") REFERENCES "columns"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tasks_assignee" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    // 6. Comments table
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" SERIAL NOT NULL,
        "content" text NOT NULL,
        "task_id" integer NOT NULL,
        "author_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_task" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // 7. Activity Logs table
    await queryRunner.query(`
      CREATE TABLE "activity_logs" (
        "id" SERIAL NOT NULL,
        "action" character varying(255) NOT NULL,
        "task_id" integer,
        "user_id" integer,
        "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_activity_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_activity_logs_task" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_activity_logs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Indexes
    await queryRunner.query(`CREATE INDEX "idx_comments_task_id" ON "comments" ("task_id");`);
    await queryRunner.query(`CREATE INDEX "idx_logs_task_id" ON "activity_logs" ("task_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_column_id" ON "tasks" ("column_id");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_tasks_column_id";`);
    await queryRunner.query(`DROP INDEX "idx_logs_task_id";`);
    await queryRunner.query(`DROP INDEX "idx_comments_task_id";`);
    await queryRunner.query(`DROP TABLE "activity_logs";`);
    await queryRunner.query(`DROP TABLE "comments";`);
    await queryRunner.query(`DROP TABLE "tasks";`);
    await queryRunner.query(`DROP TABLE "columns";`);
    await queryRunner.query(`DROP TABLE "boards";`);
    await queryRunner.query(`DROP TABLE "workspaces";`);
    await queryRunner.query(`DROP TABLE "users";`);
  }
}
