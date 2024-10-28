import { Client } from "pg";

export const psqlClient = new Client({
  user: "postgres",
  host: "localhost",
  database: "bot",
  password: "yuki",
  port: 5432,
});
