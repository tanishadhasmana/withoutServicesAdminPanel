import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasRole = await knex.schema.hasColumn("users", "role");
  if (!hasRole) {
    await knex.schema.alterTable("users", (table) => {
      table.string("role", 100).nullable().after("roleId");
    });
  }

  const users = await knex("users").select("id", "roleId");
  for (const u of users) {
    if (u.roleId) {
      const roleRow = await knex("roles").where("id", u.roleId).first();
      if (roleRow && roleRow.role) {
        await knex("users").where({ id: u.id }).update({ role: roleRow.role });
      }
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasRole = await knex.schema.hasColumn("users", "role");
  if (hasRole) {
    await knex.schema.alterTable("users", (table) => {
      table.dropColumn("role");
    });
  }
}
