# PostgreSQL Local Setup - Homebrew

This guide shows how to find the **Host, Port, Database, Username, and Password** for a PostgreSQL instance running locally through **Homebrew on macOS**.

> **Important:** PostgreSQL does not expose the existing password in plaintext. If you do not know the password, you can reset it.

---

## 1. Check whether PostgreSQL is running

List Homebrew services:

```bash
brew services list
```

Look for something like:

```text
postgresql@16    started    <user>    ~/Library/LaunchAgents/homebrew.mxcl.postgresql@16.plist
```

If PostgreSQL is not running, start it with:

```bash
brew services start postgresql
```

If you installed a versioned formula, use that version instead:

```bash
brew services start postgresql@16
```

To stop PostgreSQL:

```bash
brew services stop postgresql
```

To restart PostgreSQL:

```bash
brew services restart postgresql
```

---

## 2. Check the PostgreSQL version

```bash
psql --version
```

Example:

```text
psql (PostgreSQL) 16.4
```

You can also check the server version after connecting:

```bash
psql -U postgres -c "SELECT version();"
```

---

# Finding Connection Details

A typical local PostgreSQL connection looks like:

```text
Host:     localhost
Port:     5432
Database: myapp
Username: postgres
Password: <your password>
```

The following sections show how to find each value.

---

## 3. Find the Host

For a standard local Homebrew PostgreSQL installation, the host is usually:

```text
localhost
```

You can also use:

```text
127.0.0.1
```

To check PostgreSQL's configured listen address:

```bash
psql -U postgres -c "SHOW listen_addresses;"
```

Example:

```text
 listen_addresses
------------------
 localhost
```

If it returns `*`, PostgreSQL is configured to listen on network interfaces as well.

### Recommended local development value

```text
Host = localhost
```

---

## 4. Find the Port

The default PostgreSQL port is:

```text
5432
```

To verify the actual configured port:

```bash
psql -U postgres -c "SHOW port;"
```

Example:

```text
 port
------
 5432
```

You can also check whether something is listening on port `5432`:

```bash
lsof -i :5432
```

If PostgreSQL is using another port, use the port reported by `SHOW port`.

### Recommended command

```bash
psql -U postgres -c "SHOW port;"
```

---

## 5. Find the Databases

List all databases:

```bash
psql -U postgres -l
```

Example:

```text
                                             List of databases
   Name    |  Owner   | Encoding | Collate | Ctype | Access privileges
-----------+----------+----------+---------+-------+-------------------
 myapp     | postgres | UTF8     | C         | C     |
 postgres  | postgres | UTF8     | C         | C     |
 template0 | postgres | UTF8     | C         | C     | =c/postgres
 template1 | postgres | UTF8     | C         | C     | =c/postgres
```

If your application uses `myapp`, then:

```text
Database = myapp
```

### Find the database you're currently connected to

```bash
psql -U postgres -c "SELECT current_database();"
```

---

## 6. Find PostgreSQL Users / Usernames

List all PostgreSQL roles:

```bash
psql -U postgres -c "\du"
```

Example:

```text
                             List of roles
 Role name |                         Attributes
-----------+------------------------------------------------------------
 postgres  | Superuser, Create role, Create DB
 yash      | Create DB
```

You can also query users directly:

```bash
psql -U postgres -c "SELECT usename FROM pg_user;"
```

Example:

```text
 usename
---------
 postgres
 yash
```

### Find the current PostgreSQL user

```bash
psql -c "SELECT current_user;"
```

This is useful when `psql` allows you to connect without explicitly providing `-U`.

---

# 7. Find the Password

## Important

You generally **cannot retrieve the existing PostgreSQL password in plaintext**.

PostgreSQL stores password information securely rather than providing the original password back to you.

If you already know the password, use it.

If you don't know it, reset it.

---

## 8. Reset the PostgreSQL Password

First connect to PostgreSQL:

```bash
psql -U postgres
```

Then run:

```sql
ALTER USER postgres WITH PASSWORD 'new_password';
```

For example:

```sql
ALTER USER postgres WITH PASSWORD 'postgres123';
```

Exit:

```sql
\q
```

Your new credentials are now:

```text
Username: postgres
Password: postgres123
```

> **Security note:** Don't use simple passwords like `postgres123` for production systems. For local development it may be acceptable temporarily, but a stronger password is preferable.

---

# 9. Test the Connection

After you know the username, password, host, port, and database, test the connection:

```bash
psql -h localhost -p 5432 -U postgres -d myapp
```

PostgreSQL will ask for the password.

If successful, you'll see something similar to:

```text
psql (16.x)
Type "help" for help.

myapp=#
```

Exit with:

```sql
\q
```

---

# 10. Get Most Connection Details in One Command

Once connected as a PostgreSQL user, run:

```bash
psql -U postgres -c "
SELECT
    current_user AS username,
    current_database() AS database,
    inet_server_addr() AS host,
    inet_server_port() AS port;
"
```

Example:

```text
 username | database |    host    | port
----------+----------+------------+------
 postgres | myapp    | 127.0.0.1  | 5432
```

This gives you:

```text
Username = postgres
Database = myapp
Host     = 127.0.0.1
Port     = 5432
```

The password is intentionally not returned.

---

# 11. Find the PostgreSQL Configuration File

You can ask PostgreSQL where its configuration file is:

```bash
psql -U postgres -c "SHOW config_file;"
```

Example:

```text
                    config_file
-----------------------------------------------------
 /opt/homebrew/var/postgresql@16/postgresql.conf
```

You can inspect the configuration with:

```bash
cat "$(psql -U postgres -tAc 'SHOW config_file;')"
```

Useful settings include:

```text
listen_addresses
port
```

You can query them directly:

```bash
psql -U postgres -c "SHOW listen_addresses;"
psql -U postgres -c "SHOW port;"
```

---

# 12. Find PostgreSQL's Data Directory

Run:

```bash
psql -U postgres -c "SHOW data_directory;"
```

Example on Apple Silicon Macs:

```text
/opt/homebrew/var/postgresql@16
```

On Intel Macs, Homebrew commonly uses:

```text
/usr/local/var/postgresql@16
```

The exact location depends on your Homebrew installation and PostgreSQL version.

---

# 13. Check Which PostgreSQL Process Is Running

You can use:

```bash
ps aux | grep postgres
```

Or:

```bash
pgrep -fl postgres
```

This can help when multiple PostgreSQL installations or versions exist.

---

# 14. Check Which Process Is Using Port 5432

```bash
lsof -nP -iTCP:5432 -sTCP:LISTEN
```

Example:

```text
COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
postgres  1234  yash   7u   IPv6 ...    TCP *:5432 (LISTEN)
```

This confirms that a PostgreSQL server is listening on port `5432`.

---

# 15. Connect Using the `psql` Command

Basic connection:

```bash
psql -U postgres
```

Specify host:

```bash
psql -h localhost -U postgres
```

Specify database:

```bash
psql -h localhost -U postgres -d myapp
```

Specify everything except the password:

```bash
psql -h localhost -p 5432 -U postgres -d myapp
```

You'll then be prompted for the password.

---

# 16. Useful `psql` Commands

Once you're inside `psql`:

### List databases

```sql
\l
```

### List users / roles

```sql
\du
```

### List tables

```sql
\dt
```

### Show current database

```sql
SELECT current_database();
```

### Show current user

```sql
SELECT current_user;
```

### Show PostgreSQL version

```sql
SELECT version();
```

### Show server port

```sql
SHOW port;
```

### Show host/listen address

```sql
SHOW listen_addresses;
```

### Exit `psql`

```sql
\q
```

---

# 17. PostgreSQL Connection URL

Once you have the values:

```text
Host:     localhost
Port:     5432
Database: myapp
Username: postgres
Password: mypassword
```

Your PostgreSQL connection URL is:

```text
postgresql://postgres:mypassword@localhost:5432/myapp
```

The general format is:

```text
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

---

# 18. Using It in `.env`

For a Node.js / Prisma / SQLAlchemy application, you will commonly put the connection string in `.env`:

```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/myapp"
```

For example:

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/myapp"
```

### Important

Do **not** commit `.env` to Git.

Add it to `.gitignore`:

```gitignore
.env
.env.*
```

If you need to share the project with someone, share an example file instead:

```text
.env.example
```

Example:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE"
```

---

# 19. Quick Reference

| Detail | Command / Value |
|---|---|
| Host | Usually `localhost` |
| Port | `psql -U postgres -c "SHOW port;"` |
| Databases | `psql -U postgres -l` |
| Users | `psql -U postgres -c "\du"` |
| Current user | `psql -c "SELECT current_user;"` |
| Current database | `psql -U postgres -c "SELECT current_database();"` |
| Password | Cannot be retrieved; reset if unknown |
| Config file | `psql -U postgres -c "SHOW config_file;"` |
| Data directory | `psql -U postgres -c "SHOW data_directory;"` |
| Running service | `brew services list` |
| Start PostgreSQL | `brew services start postgresql` |
| Stop PostgreSQL | `brew services stop postgresql` |
| Restart PostgreSQL | `brew services restart postgresql` |

---

# 20. Fastest Workflow

If you just want to get your local PostgreSQL connection details quickly:

### Step 1 — Check the service

```bash
brew services list
```

### Step 2 — Connect

```bash
psql -U postgres
```

### Step 3 — Check port

```sql
SHOW port;
```

### Step 4 — Check current user

```sql
SELECT current_user;
```

### Step 5 — Check current database

```sql
SELECT current_database();
```

### Step 6 — List databases

```sql
\l
```

### Step 7 — Exit

```sql
\q
```

Then your local connection will generally be:

```text
Host:     localhost
Port:     5432
Database: <your database>
Username: <your PostgreSQL user>
Password: <your PostgreSQL password>
```

And the connection string:

```text
postgresql://<username>:<password>@localhost:<port>/<database>
```
