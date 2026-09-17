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

await client.connect((err) => {
    if(!err) console.log("Thik h");
    console.log("Connection done");
})

const query = "SELECT * FROM users;"
console.log(query);

await client.end((err) => {
    console.log("Connection closed");
})
// db();
