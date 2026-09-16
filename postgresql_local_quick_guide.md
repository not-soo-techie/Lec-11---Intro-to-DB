# PostgreSQL Local Development - Quick Guide

A quick reference for managing a **local PostgreSQL database on macOS using Homebrew**.

---

## 1. Check PostgreSQL

Check whether PostgreSQL is running:

```bash
brew services list
```

Start PostgreSQL:

```bash
brew services start postgresql
```

Restart:

```bash
brew services restart postgresql
```

Stop:

```bash
brew services stop postgresql
```

Check the installed version:

```bash
psql --version
```

---

# 2. Connect to PostgreSQL

Connect using the `postgres` user:

```bash
psql -U postgres
```

You will see something like:

```text
postgres=#
```

This means you are inside the PostgreSQL command-line client (`psql`) and are currently connected to the `postgres` database.

Check the current database:

```sql
SELECT current_database();
```

Check the current user:

```sql
SELECT current_user;
```

Exit:

```sql
\q
```

---

# 3. List Databases

From inside `psql`:

```sql
\l
```

Or directly from the terminal:

```bash
psql -U postgres -l
```

Typical databases include:

```text
postgres
template0
template1
```

---

# 4. Create a Database

### From inside `psql`

```sql
CREATE DATABASE myapp;
```

### Directly from the terminal

```bash
createdb -U postgres myapp
```

Verify:

```bash
psql -U postgres -l
```

---

# 5. Access / Connect to a Database

Connect directly from the terminal:

```bash
psql -U postgres -d myapp
```

Or, if already inside `psql`:

```sql
\c myapp
```

You should see:

```text
You are now connected to database "myapp" as user "postgres".
```

Verify:

```sql
SELECT current_database();
```

Expected:

```text
 current_database
------------------
 myapp
```

---

# 6. Create a Table

Once connected to your database:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

PostgreSQL should return:

```text
CREATE TABLE
```

---

# 7. List Tables

```sql
\dt
```

Example:

```text
 Schema | Name  | Type  | Owner
--------+-------+-------+--------
 public | users | table | postgres
```

---

# 8. See Table Structure

```sql
\d users
```

For more detailed information:

```sql
\d+ users
```

---

# 9. Insert Data

```sql
INSERT INTO users (name, email, age)
VALUES ('Yash', 'yash@example.com', 25);
```

Insert multiple rows:

```sql
INSERT INTO users (name, email, age)
VALUES
    ('Alice', 'alice@example.com', 24),
    ('Bob', 'bob@example.com', 26);
```

---

# 10. Read Data

Get all users:

```sql
SELECT * FROM users;
```

Get specific columns:

```sql
SELECT name, email FROM users;
```

Filter data:

```sql
SELECT * FROM users
WHERE age > 24;
```

---

# 11. Update Data

```sql
UPDATE users
SET age = 26
WHERE email = 'yash@example.com';
```

Always be careful with `UPDATE` without a `WHERE` clause because it can modify every row.

---

# 12. Delete Data

Delete a specific row:

```sql
DELETE FROM users
WHERE email = 'yash@example.com';
```

Be careful with:

```sql
DELETE FROM users;
```

This deletes all rows from the table.

---

# 13. Delete / Drop a Table

Delete the table completely:

```sql
DROP TABLE users;
```

Safer version:

```sql
DROP TABLE IF EXISTS users;
```

> `DROP TABLE` removes the table and all data inside it.

---

# 14. Delete / Drop a Database

First connect to another database:

```sql
\c postgres
```

Then:

```sql
DROP DATABASE myapp;
```

Or directly from the terminal:

```bash
dropdb -U postgres myapp
```

> You cannot normally drop the database you are currently connected to. Also, dropping a database permanently removes everything inside it.

---

# 15. Useful `psql` Commands

These commands start with `\` and are specific to the `psql` client.

```text
\l              List databases
\c myapp        Connect to myapp
\dt             List tables
\d users        Show users table structure
\d+ users       Detailed table information
\du             List PostgreSQL users/roles
\conninfo       Show current connection information
\q              Exit psql
```

---

# 16. Check Connection Details

Current user:

```sql
SELECT current_user;
```

Current database:

```sql
SELECT current_database();
```

PostgreSQL server port:

```sql
SHOW port;
```

Listen address:

```sql
SHOW listen_addresses;
```

Full connection information:

```sql
\conninfo
```

A typical local setup looks like:

```text
Host:     localhost
Port:     5432
Database: myapp
Username: postgres
Password: <your password>
```

---

# 17. PostgreSQL Connection URL

General format:

```text
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

Example:

```text
postgresql://postgres:mypassword@localhost:5432/myapp
```

For a Node.js / Prisma / SQLAlchemy application, this is commonly stored in `.env`:

```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/myapp"
```

> Never commit your real `.env` file or database password to Git.

---

# 18. Complete Example

Create a database:

```bash
createdb -U postgres jobapp
```

Connect to it:

```bash
psql -U postgres -d jobapp
```

Create a table:

```sql
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL,
    location VARCHAR(100),
    salary INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Check the table:

```sql
\dt
```

Check its structure:

```sql
\d jobs
```

Insert a job:

```sql
INSERT INTO jobs (title, company, location, salary)
VALUES ('Backend Engineer', 'Example Corp', 'Bangalore', 2500000);
```

Read the job:

```sql
SELECT * FROM jobs;
```

Exit:

```sql
\q
```

---

# Quick Cheat Sheet

```bash
# PostgreSQL service
brew services list
brew services start postgresql
brew services stop postgresql
brew services restart postgresql

# Connect
psql -U postgres
psql -U postgres -d myapp

# Create / delete database
createdb -U postgres myapp
dropdb -U postgres myapp
```

Inside `psql`:

```sql
-- Databases
\l
CREATE DATABASE myapp;
\c myapp

-- Tables
\dt
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);
\d users

-- Data
INSERT INTO users (name, email)
VALUES ('Yash', 'yash@example.com');

SELECT * FROM users;

UPDATE users
SET name = 'Yashvendra'
WHERE id = 1;

DELETE FROM users
WHERE id = 1;

-- Remove table
DROP TABLE users;

-- Connection information
\conninfo
SELECT current_database();
SELECT current_user;

-- Exit
\q
```

---

## Basic Mental Model

```text
PostgreSQL Server
│
├── Database: postgres
│
├── Database: myapp
│   │
│   ├── Table: users
│   │   ├── id
│   │   ├── name
│   │   └── email
│   │
│   └── Table: jobs
│       ├── id
│       ├── title
│       └── company
│
└── Database: test_db
```

**Server → Database → Tables → Rows**
