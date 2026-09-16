# From In-Memory Data to Databases

## Learning Goals

By the end of this note, you should be able to:

- Explain why application memory is not suitable for permanent storage.
- Understand how file-based storage provides persistence and where it starts to fail.
- Explain the role of a database in a backend application.
- Understand how a Node.js application communicates with PostgreSQL.
- Explain what a database driver does.
- Understand why applications use connection pools.
- Understand the trade-offs of using raw SQL.
- Explain what an ORM is and why it is useful.
- Understand that an ORM does not replace SQL or the database.

---

# 1. Where Does Application Data Live?

Consider a simple backend application that allows users to create tasks.

A first implementation might store tasks in a JavaScript array:

```js
const tasks = [];
```

When a request creates a task:

```js
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
```

The tasks can then be returned:

```js
app.get("/tasks", (req, res) => {
    res.json(tasks);
});
```

This works while the application is running.

## The Problem

What happens if:

1. The server crashes?
2. We restart the application?
3. We deploy a new version?

The data stored in `const tasks = []` is lost.

Why?

Because the array exists inside the **Node.js process memory (RAM)**.

When the process stops, its memory is released.

When the application starts again, this line executes again:

```js
const tasks = [];
```

A new, empty array is created.

### Important Idea

> **Application memory is temporary (volatile) storage.**

It is useful for temporary state, but it should not normally be treated as permanent storage for important application data.

---

# 2. File-Based Storage

A simple solution is to store the data in a file:

```text
tasks.json
```

The application can:

```text
Read the file
      ↓
Convert JSON → JavaScript
      ↓
Modify the data
      ↓
Convert JavaScript → JSON
      ↓
Write the file
```

A simplified example:

```js
const fs = require("fs");

const tasks = JSON.parse(
    fs.readFileSync("tasks.json", "utf-8")
);

tasks.push({
    id: tasks.length + 1,
    title: "Learn databases",
});

fs.writeFileSync(
    "tasks.json",
    JSON.stringify(tasks, null, 2)
);
```

Now, if the server restarts, the data can be read from the file again.

So we have solved one problem:

```text
Array
  ↓
Data disappears after restart

File
  ↓
Data survives restart
```

But as the application grows, new problems appear.

---

# 3. Why Files Start Becoming Difficult

Imagine that TaskFlow becomes popular and thousands of users start using it.

## 3.1 Concurrent Writes

Suppose two users create tasks at almost the same time.

The file initially contains:

```json
[
    "Learn Node.js"
]
```

Both requests read the same version of the file.

Request A creates:

```json
[
    "Learn Node.js",
    "Task A"
]
```

Request B creates:

```json
[
    "Learn Node.js",
    "Task B"
]
```

If A writes first and B writes immediately afterward, the final file could contain:

```json
[
    "Learn Node.js",
    "Task B"
]
```

Task A has been overwritten.

This is an example of a **race condition**.

> Multiple requests can interact with shared data at the same time, and simple file storage does not naturally provide the mechanisms required to safely coordinate those operations.

---

## 3.2 Searching Large Data

Imagine `tasks.json` contains 100,000 tasks.

Requirement:

> "Return all incomplete tasks belonging to user 42."

A simple file-based approach may need to:

```text
Read the entire file
        ↓
Parse the entire file
        ↓
Loop through the records
        ↓
Filter matching records
        ↓
Return the result
```

Doing this repeatedly for many requests becomes inefficient.

A database is specifically designed to store structured data and execute queries efficiently. Databases can also use mechanisms such as **indexes** to make certain searches much faster.

---

## 3.3 Relationships Between Data

Suppose TaskFlow has users and tasks.

A task might contain:

```json
{
    "id": 15,
    "title": "Complete assignment",
    "ownerId": 42
}
```

Here, `ownerId` is intended to refer to a user.

But what happens if user `42` does not exist?

A simple JSON file does not automatically understand:

```text
Task.ownerId → User.id
```

The application has to manually enforce this relationship.

---

## 3.4 Data Rules

Suppose we receive:

```json
{
    "title": 500
}
```

or:

```json
{
    "ownerId": "abc"
}
```

or:

```json
{
    "done": "sometimes"
}
```

The application needs to decide whether these values are valid.

A database can provide mechanisms for enforcing many kinds of data rules and constraints.

---

# 4. File Storage vs Database

Files are not useless. They are useful for things such as configuration files, logs, small local datasets, and simple scripts.

But when an application needs reliable, structured, concurrent access to large amounts of data, a database becomes much more appropriate.

| Requirement | Simple File | Database |
|---|---|---|
| Persistence | Yes | Yes |
| Structured querying | Limited | Strong |
| Concurrent operations | Difficult to manage safely | Designed for it |
| Relationships | Manual | Supported |
| Data constraints | Mostly application-managed | Database-supported |
| Indexing | Limited/manual | Built-in database feature |
| Transactions | Not naturally provided | Supported |

> **A database is not simply a bigger file. It is a software system designed specifically to manage structured data.**

---

# 5. What Is a Database?

A database is a system used to store, organize, retrieve, and manage data.

A simplified backend architecture is:

```text
Client
   ↓
Node.js Backend
   ↓
Database
```

Common databases include:

- PostgreSQL
- MySQL
- MongoDB

For this course, we will use **PostgreSQL** when discussing relational database communication from Node.js.

The focus here is:

> **How does a Node.js application communicate with PostgreSQL?**

---

# 6. Node.js and PostgreSQL Are Separate Programs

Node.js and PostgreSQL are separate software systems.

Conceptually:

```text
Node.js Process
       |
       | Communication
       |
PostgreSQL Process
```

Node.js cannot simply access PostgreSQL's internal memory.

It needs a way to communicate with the PostgreSQL server.

This communication involves a **database connection**.

---

# 7. Database Connection

A database connection is a communication session between an application and a database server.

Typical connection information includes:

| Information | Meaning |
|---|---|
| Host | Where the database server is running |
| Port | Network port used by the database |
| Database | Which database to use |
| Username | Database user |
| Password | Authentication credential |

PostgreSQL commonly uses:

```text
5432
```

as its default port.

Conceptually:

```text
Node.js Application
       ↓
Database Connection
       ↓
PostgreSQL
```

Once a connection exists, the application can:

- Authenticate with the database.
- Send SQL queries.
- Receive query results.
- Receive database errors.

---

# 8. Database Driver

A **database driver** is a library that allows an application to communicate with a particular database system.

For PostgreSQL, a commonly used Node.js driver is:

```text
pg
```

Install it:

```bash
npm install pg
```

Architecture:

```text
Node.js
   ↓
PostgreSQL Driver (pg)
   ↓
PostgreSQL
```

The driver can:

- Open database connections.
- Send SQL queries.
- Receive results.
- Convert returned rows into JavaScript-friendly objects.
- Handle database errors.

---

# 9. Using a PostgreSQL Client

A simple example uses the `Client` class:

```js
const { Client } = require("pg");

const client = new Client({
    host: "localhost",
    port: 5432,
    user: "taskflow_app",
    password: process.env.DB_PASSWORD,
    database: "taskflow",
});

await client.connect();
```

We can execute a query:

```js
const result = await client.query(
    "SELECT * FROM tasks"
);

console.log(result.rows);
```

Conceptually:

```text
JavaScript
    ↓
client.query()
    ↓
pg Driver
    ↓
PostgreSQL
    ↓
Query Result
    ↓
JavaScript
```

Returned rows can look like:

```js
[
    {
        id: 1,
        title: "Learn databases",
        done: false
    },
    {
        id: 2,
        title: "Build TaskFlow",
        done: true
    }
]
```

---

# 10. Why Not Create a New Connection for Every Request?

Imagine our application receives 500 requests.

A naive approach could be:

```text
Request
   ↓
Create connection
   ↓
Connect
   ↓
Run query
   ↓
Close connection
```

Doing this repeatedly creates unnecessary connection overhead.

Applications commonly use a **connection pool** instead.

---

# 11. Connection Pool

A connection pool maintains multiple reusable database connections.

Conceptually:

```text
Request 1 ─┐
Request 2 ─┤
Request 3 ─┼──→ Connection Pool
Request 4 ─┤       ↓
Request 5 ─┘   ┌───────┐
               │ Conn1 │
               │ Conn2 │
               │ Conn3 │
               └───────┘
                   ↓
               PostgreSQL
```

With `pg`:

```js
const { Pool } = require("pg");

const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "taskflow_app",
    password: process.env.DB_PASSWORD,
    database: "taskflow",
});
```

A query can then be executed using:

```js
const result = await pool.query(
    "SELECT * FROM tasks"
);
```

The SQL query has not changed. The major difference is how database connections are managed.

### Client vs Pool

| Client | Pool |
|---|---|
| Represents a single connection | Manages multiple reusable connections |
| Useful for learning/simple scripts | Common choice for server applications |
| Connection lifecycle is managed manually | Connections can be reused |

> **Connection pooling is about efficiently managing reusable database connections when many requests interact with the database.**

---

# 12. Raw SQL

We can now communicate with PostgreSQL directly using SQL:

```js
const result = await pool.query(
    "SELECT * FROM tasks WHERE owner_id = $1",
    [ownerId]
);
```

This is **raw SQL** from the application.

Raw SQL is not inherently bad. It provides direct control over database queries.

The problem appears when a large application contains raw SQL everywhere.

---

# 13. Problems with Raw SQL Everywhere

## 13.1 Repetition

A growing application may have:

```text
users.js
tasks.js
projects.js
comments.js
notifications.js
```

Each module may contain many SQL queries.

This can lead to repeated SQL, more code, inconsistencies, and additional maintenance.

---

## 13.2 Runtime Errors

Consider:

```js
await pool.query(
    "SELECT * FROM tasks WHERE ownr_id = $1",
    [ownerId]
);
```

`ownr_id` might be a typo.

JavaScript may not understand the database schema inside the SQL string, so the error may only become visible when the query executes.

---

## 13.3 Limited Schema Awareness

With raw query results:

```js
const task = result.rows[0];
```

the editor may not automatically know:

```text
task.id       → number
task.title    → string
task.done     → boolean
```

This can make large applications harder to maintain.

---

## 13.4 Two Different Mental Models

Application code often works with:

```js
{
    id: 1,
    title: "Prepare lecture",
    done: false
}
```

A relational database works with:

```text
Tables
Rows
Columns
Foreign Keys
Relationships
```

Developers repeatedly move between these two representations.

This is one of the problems an ORM tries to reduce.

---

# 14. What Is an ORM?

ORM stands for:

> **Object-Relational Mapping**

An ORM provides an abstraction between application objects and relational database structures.

Conceptually:

```text
JavaScript Objects
        ↕
       ORM
        ↕
Relational Database
```

---

# 15. Understanding the Name

## Object

Node.js applications commonly represent data using JavaScript objects:

```js
{
    id: 1,
    title: "Learn ORM",
    done: false
}
```

## Relational

A relational database stores data using tables:

```text
tasks

id
title
done
owner_id
```

## Mapping

The ORM maps concepts between the two worlds:

```text
Database Table  → Application Model
Database Row    → Application Object
Column          → Object Property
Relationship    → Model Relationship
```

---

# 16. What Can an ORM Help With?

An ORM can help developers:

- Represent database tables as application models.
- Generate SQL for common operations.
- Convert database rows into application-friendly objects.
- Reduce repetitive database interaction code.
- Provide better autocomplete and schema awareness.
- Represent relationships between models.
- Centralize knowledge of database structure.

For example, raw SQL might look like:

```js
const result = await pool.query(
    "SELECT * FROM tasks WHERE owner_id = $1",
    [ownerId]
);
```

An ORM might provide an API conceptually similar to:

```js
const tasks = await Task.findMany({
    where: {
        ownerId: ownerId
    }
});
```

The exact syntax depends on the ORM.

Examples include:

- Prisma
- Sequelize
- TypeORM
- Drizzle

The important thing is the concept, not memorizing a particular ORM's syntax.

---

# 17. ORM Does Not Replace the Database

An ORM is an abstraction layer.

The database is still there.

Conceptually:

```text
Application
     ↓
    ORM
     ↓
   SQL
     ↓
Database
```

An ORM does not mean:

> "We don't need SQL anymore."

You should still understand:

- Tables
- Rows
- Columns
- Relationships
- Keys
- Queries
- Indexes
- Transactions
- Database design

> **An ORM is a translator/abstraction, not a replacement for the database.**

---

# 18. ORM vs Raw SQL

It is better not to think:

```text
ORM = Good
SQL = Bad
```

A better mental model is:

```text
ORM
 ↓
Useful abstraction for common application operations

Raw SQL
 ↓
Useful when direct control or specialized queries are needed
```

Complex reporting, analytics, or performance-sensitive queries may still benefit from writing SQL directly.

So the practical approach can be:

> **Use an ORM where its abstraction improves development, and use raw SQL when direct database control is beneficial.**

---

# 19. The Complete Evolution

The entire lecture can be summarized as an evolution of solutions:

```text
JavaScript Array
       ↓
Problem: Data disappears after restart
       ↓
File Storage
       ↓
Problems: Concurrency, querying, relationships, rules
       ↓
Database
       ↓
Problem: Node.js needs to communicate with it
       ↓
Database Driver
       ↓
Problem: Many requests need database connections
       ↓
Connection Pool
       ↓
Problem: Raw SQL becomes repetitive in large applications
       ↓
ORM
```

The important lesson is:

> **Technology is usually introduced to solve a problem created by the limitations of an earlier approach.**

---

# 20. Key Takeaways

1. **Application memory is temporary.**
   Data stored only in RAM disappears when the process stops.

2. **Files provide persistence.**
   But they become difficult to manage for large, concurrent, structured applications.

3. **Databases are specialized data-management systems.**
   They provide querying, relationships, constraints, concurrency mechanisms, indexing, transactions, and other capabilities.

4. **Node.js and PostgreSQL are separate systems.**
   They communicate through database connections.

5. **A database driver connects application code to a database.**
   `pg` is a commonly used PostgreSQL driver for Node.js.

6. **Connection pools reuse database connections.**
   This avoids repeatedly creating and closing connections for requests.

7. **Raw SQL is not bad.**
   It gives direct control over database queries.

8. **Large applications can accumulate a lot of repetitive raw SQL.**
   This can increase maintenance and schema-awareness problems.

9. **ORM means Object-Relational Mapping.**
   It provides an abstraction between application objects and relational database structures.

10. **ORM does not replace SQL or databases.**
    It is an abstraction layer that can simplify common database operations.

---

# 21. Questions to Think About

## Beginner

1. Why does data stored in a JavaScript array disappear after restarting a Node.js application?
2. What problem does storing data in a JSON file solve?
3. What is a database?
4. What is the default PostgreSQL port commonly used for connections?
5. What is the purpose of the `pg` package?

## Intermediate

6. How can two simultaneous file writes result in lost data?
7. Why can searching a very large JSON file become inefficient?
8. Why does a Node.js application need a database driver to communicate with PostgreSQL?
9. What problem does a connection pool solve?
10. What is the difference between a `Client` and a `Pool` in `pg`?

## Advanced Exploration

11. What is a race condition?
12. How do database indexes make searches faster?
13. What are database transactions and why are they useful?
14. What are foreign keys and how do they help maintain relationships?
15. How does an ORM generate SQL?
16. When might raw SQL be preferable to an ORM?
17. What problems can poorly written ORM queries create?
18. How would you decide how many database connections should exist in a connection pool?

---

# 22. Suggested Self-Study

After understanding this lecture, explore these topics in order:

```text
1. PostgreSQL basics
       ↓
2. Node.js + PostgreSQL using pg
       ↓
3. Parameterized SQL queries
       ↓
4. Connection pooling
       ↓
5. Database indexes
       ↓
6. Transactions
       ↓
7. Database constraints
       ↓
8. ORM concepts
       ↓
9. Prisma / Drizzle / Sequelize
       ↓
10. ORM vs Raw SQL
```

Don't try to learn everything at once.

The goal of this lecture is to understand **why these technologies exist**. The implementation details can be explored step by step.

---

# 23. A Question to Keep in Mind

Whenever you learn a new backend technology, ask:

> **"What problem is this technology solving?"**

For this lecture:

```text
Array
→ Persistence problem

File
→ Data management problem

Database
→ Application communication problem

Driver
→ Database communication problem

Pool
→ Connection management problem

ORM
→ Application/database abstraction problem
```

Understanding the problems first will make the technologies much easier to learn.
