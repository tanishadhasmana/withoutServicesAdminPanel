import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("role_permissions", (table) => {
    table.increments("id").primary();
    table.integer("roleId").unsigned().notNullable()
      .references("id").inTable("roles").onDelete("CASCADE");
    table.integer("permissionId").unsigned().notNullable()
      .references("id").inTable("permissions").onDelete("CASCADE");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").nullable();
    table.timestamp("deletedAt").nullable();

    table.unique(["roleId", "permissionId"]); // prevent duplicates
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("role_permissions");
}