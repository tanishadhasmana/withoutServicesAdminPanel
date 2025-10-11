import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("roles", (table) => {
    table.increments("id").primary(); // roleId
    table.string("role", 100).notNullable();
    table.text("description").nullable();
    table.enum("status", ["active", "inactive"]).defaultTo("active");
    table.integer("createdBy").unsigned().nullable().references("id").inTable("users");
    table.integer("updatedBy").unsigned().nullable().references("id").inTable("users");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").nullable();
    table.timestamp("deletedAt").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("roles");
}
