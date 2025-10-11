import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("email_templates", (table) => {
    table.increments("id").primary();
    table.string("key").notNullable();
    table.string("title").nullable();
    table.string("subject").nullable();
    table.string("fromEmail").nullable();
    table.string("fromName").nullable();
    table.enum("status", ["active", "inactive"]).defaultTo("active");
    table.text("body").nullable();
    table.integer("createdBy").unsigned().nullable().references("id").inTable("users");
    table.integer("updatedBy").unsigned().nullable().references("id").inTable("users");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").nullable();
    table.timestamp("deletedAt").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("email_templates");
}
