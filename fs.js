const fs = require("fs");
const path = require("path")

const filePath = path.join(__dirname, "tasks.json")

const tasks = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
);

tasks.push({
    id: tasks.length + 1,
    title: "Learn databases",
});

fs.writeFileSync(
    "tasks.json",
    JSON.stringify(tasks, null, 2)
);
