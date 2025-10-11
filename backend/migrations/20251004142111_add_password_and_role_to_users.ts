import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.string("password", 255).notNullable().after("email"); 
    table.enum("role", ["developer", "manager", "admin", "onlyFAQ"])
      .defaultTo("onlyFAQ")
      .after("password"); 
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.dropColumn("password");
    table.dropColumn("role");
  });
}
