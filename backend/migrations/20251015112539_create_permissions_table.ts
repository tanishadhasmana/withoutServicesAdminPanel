
import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("permissions", (table) => {
    table.increments("id").primary();
    table.string("name", 150).notNullable().unique(); // e.g. "user_list"
    table.enum("status", ["active", "inactive"]).defaultTo("active");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").nullable();
    table.timestamp("deletedAt").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("permissions");
}