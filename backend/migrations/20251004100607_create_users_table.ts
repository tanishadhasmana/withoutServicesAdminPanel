import { Knex } from "knex";
// up runs when apply migration, to create or modify tables.
// down run when rolling back migration, like to undo changes.
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary(); // userId
    table.string("firstName", 100).notNullable();
    table.string("lastName", 100).notNullable();
    table.string("email", 255).unique().notNullable();
    table.string("phone", 20);
    table.enum("status", ["active", "inactive"]).defaultTo("active");
    table.string("profileImage").nullable(); 
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").nullable();
    table.timestamp("deletedAt").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}
