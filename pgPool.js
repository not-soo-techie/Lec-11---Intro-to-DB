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

await client.connect();

const result = await client.query(
    "SELECT * FROM users"
);

console.log(result.rows);

await client.end();