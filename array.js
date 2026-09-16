const express = require("express")

const app = express();

const tasks = [];

app.use(express.json())

app.post("/tasks", (req, res) => {
    const { title } = req.body;

    const task = {
        id: tasks.length + 1,
        title,
    };

    tasks.push(task);

    res.status(201).json({
        message: "Task created successfully",
        task,
    });
});

app.get("/tasks", (req, res) => {
    res.json(tasks);
});

app.listen(3111, () => {
    console.log("Server running");
})
