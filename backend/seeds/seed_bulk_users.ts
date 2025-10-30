import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
  console.log("Seeding 1,100,000 users...");

  const TOTAL = 2_000_000;
  const START_ID = 1100041; 
  const BATCH = 5000;

  const passwordHash = await bcrypt.hash("Password@123", 10);

  for (let i = 0; i < TOTAL; i += BATCH) {
    const users: any[] = [];

    for (let j = 0; j < BATCH && i + j < TOTAL; j++) {
      const n = START_ID + i + j;
      users.push({
        firstName: `User${n}`,
        lastName: `Demo${n}`,
        email: `user${n}@example.com`,
        password: passwordHash,
        roleId: Math.floor(Math.random() * 9) + 2, // roleId between 2 & 10 will be assigned
        phone: `+91 90000${n.toString().slice(-5)}`,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        profileImage: null,
      });
    }

    await knex.batchInsert("users", users);
    console.log(`Inserted: ${i + users.length}/${TOTAL}`);
  }

  console.log("Completed inserting 1,100,000 users");
}
