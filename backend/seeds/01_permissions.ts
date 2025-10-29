import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("permissions").del();

  await knex("permissions").insert([
    { name: "user_list", status: "active" },
    { name: "user_add", status: "active" },
    { name: "user_edit", status: "active" },
    { name: "user_delete", status: "active" },
    { name: "role_list", status: "active" },
    { name: "role_add", status: "active" },
    { name: "role_edit", status: "active" },
    { name: "role_delete", status: "active" },
    { name: "email_list", status: "active" },
    { name: "email_add", status: "active" },
    { name: "email_edit", status: "active" },
    { name: "email_delete", status: "active" },
    { name: "cms_list", status: "active" },
    { name: "cms_add", status: "active" },
    { name: "cms_edit", status: "active" },
    { name: "cms_delete", status: "active" },
    { name: "faq_list", status: "active" },
    { name: "faq_add", status: "active" },
    { name: "faq_edit", status: "active" },
    { name: "faq_delete", status: "active" },
    { name: "config_list", status: "active" },
    { name: "config_add", status: "active" },
    { name: "config_edit", status: "active" },
    { name: "config_delete", status: "active" },
    { name: "logs_list", status: "active" },
    { name: "logs_add", status: "active" },
    { name: "logs_edit", status: "active" },
    { name: "logs_delete", status: "active" },
  ]);
}

