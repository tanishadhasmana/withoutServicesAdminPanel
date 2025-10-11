import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("cms", (table) => {
    table.increments("id").primary();
    table.string("key").notNullable();
    table.string("title").nullable();
    table.string("metaKeyword").nullable();
    table.string("metaTitle").nullable();
    table.text("metaDescription").nullable();
    table.enum("status", ["active", "inactive"]).defaultTo("active");
    table.text("content").nullable();
    table.integer("createdBy").unsigned().nullable().references("id").inTable("users");
    table.integer("updatedBy").unsigned().nullable().references("id").inTable("users");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").nullable();
    table.timestamp("deletedAt").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("cms");
}
