import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1️⃣ Add new column
  await knex.schema.alterTable("users", (table) => {
    table.integer("roleId").unsigned().nullable().after("password");
  });

  // 2️⃣ Migrate existing ENUM role → roleId
  const existingUsers = await knex("users").select("id", "role");
  for (const user of existingUsers) {
    if (!user.role) continue;
    const roleRecord = await knex("roles").where("role", user.role).first();
    if (roleRecord) {
      await knex("users").where("id", user.id).update({ roleId: roleRecord.id });
    } else {
      const [newRoleId] = await knex("roles").insert({ role: user.role });
      await knex("users").where("id", user.id).update({ roleId: newRoleId });
    }
  }

  // 3️⃣ Drop old ENUM role column
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("role");
  });

  // 4️⃣ Add FK constraint
  await knex.schema.alterTable("users", (table) => {
    table
      .foreign("roleId")
      .references("id")
      .inTable("roles")
      .onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.enum("role", ["developer", "manager", "admin", "onlyFAQ"]).defaultTo("onlyFAQ");
    table.dropForeign(["roleId"]);
    table.dropColumn("roleId");
  });
}
