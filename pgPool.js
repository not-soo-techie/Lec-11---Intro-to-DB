import { Pool } from "pg"
// const { Pool } = require("pg")

const client = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "new_password",
    database: "myapp",
    max: 10
});

const pool = await client.connect();

const result = await pool.query(
    "SELECT * FROM users"
);

console.log(result.rows);

pool.release();
// await pool.end();