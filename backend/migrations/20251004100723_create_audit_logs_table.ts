import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("audit_logs", (table) => {
    table.increments("id").primary();
    table.integer("userId").unsigned().references("id").inTable("users"); // who performed
    table.string("username").notNullable();
    table.string("type").nullable(); // view, authentication, etc
    table.text("activity").nullable(); // what action
    table.timestamp("timestamp").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("audit_logs");
}
