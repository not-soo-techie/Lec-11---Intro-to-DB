// const { Client } = require("pg")
import { Client } from "pg"

const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "new_password",
    database: "ramanujandb"
})

// async function db () {
    
// }

await client.connect()

const query = "SELECT * FROM users;"
console.log(query);

await client.end()
// db();
