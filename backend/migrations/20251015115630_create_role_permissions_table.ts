import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("role_permissions", (table) => {
    table.increments("id").primary();
    // unsigned means it cant be negative, and .refrnce creating a foreign key constraint that links this col role id to the id col of roles table., cascade means if role dlted from the roles table all related enteries in role permissions table will be automatically dlted.
    table.integer("roleId").unsigned().notNullable()
      .references("id").inTable("roles").onDelete("CASCADE");
      // id of permission link to id col in permissions table, if permission dlted, related entries also dlted.
    table.integer("permissionId").unsigned().notNullable()
      .references("id").inTable("permissions").onDelete("CASCADE");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").nullable();
    table.timestamp("deletedAt").nullable();
// A role cannot have the same permission assigned twice.
    table.unique(["roleId", "permissionId"]); 
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("role_permissions");
}