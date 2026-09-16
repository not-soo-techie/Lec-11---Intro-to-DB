const { Client } = require("pg")

const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "new_password",
    database: "myapp"
});

await client.connect();

const result = await client.query(
    "SELECT * FROM users"
);

console.log(result.rows);

await client.end();