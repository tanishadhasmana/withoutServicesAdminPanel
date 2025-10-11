import dotenv from "dotenv";

dotenv.config();

const config = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: "./migrations",
      extension: "ts", 
    },
    seeds: {
      directory: "./seeds",
      extension: "ts",
    },
    pool: { min: 0, max: 7 },
  },
};

export default config;
