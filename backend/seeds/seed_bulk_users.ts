import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
  console.log("Seeding 3,100,000 users...");
// total users to insert
  const TOTAL = 2_000_000;
  //first user id to be started
  const START_ID = 1100041; 
  // at a single time we inserting 5000 only
  const BATCH = 5000;

  const passwordHash = await bcrypt.hash("Password@123", 10);
// how many baches we create, inc by 500, each time
  for (let i = 0; i < TOTAL; i += BATCH) {
    const users: any[] = [];
// inside batches this create users, j<batchensure users not more than 5000, so j from 0->4999, and i+j<TOTAL ensure stop after total users are created.
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
        // js date obj 2025-11-03 11:12:15 (local time)
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
