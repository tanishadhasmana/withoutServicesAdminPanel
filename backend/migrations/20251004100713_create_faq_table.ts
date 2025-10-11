import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("faq", (table) => {
    table.increments("id").primary();
    table.text("question").notNullable();
    table.text("answer").nullable();
    table.enum("status", ["active", "inactive"]).defaultTo("active");
    table.integer("displayOrder").defaultTo(0);
    table.integer("createdBy").unsigned().nullable().references("id").inTable("users");
    table.integer("updatedBy").unsigned().nullable().references("id").inTable("users");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").nullable();
    table.timestamp("deletedAt").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("faq");
}
