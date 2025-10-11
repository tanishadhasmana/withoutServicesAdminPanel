import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("application_config", (table) => {
    table.increments("id").primary();
    table.string("key").notNullable();
    table.string("value").nullable();
    table.integer("displayOrder").defaultTo(0);
    table.enum("status", ["active", "inactive"]).defaultTo("active");
    table.integer("createdBy").unsigned().nullable().references("id").inTable("users");
    table.integer("updatedBy").unsigned().nullable().references("id").inTable("users");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").nullable();
    table.timestamp("deletedAt").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("application_config");
}
