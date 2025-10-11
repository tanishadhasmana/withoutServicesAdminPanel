import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("cms", (table) => {
    table.text("content", "longtext").nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("cms", (table) => {
    table.text("content").nullable().alter();
  });
}
