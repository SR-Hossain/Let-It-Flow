# Let-It-Flow

Mental Care related platform similar to stackOverflow

## Prerequisites

- Node.js
- MariaDB

## Database Tables

### Table: posts

| Field        | Type         | Null | Key | Default             | Extra          |
|--------------|--------------|------|-----|---------------------|----------------|
| post_id      | int(11)      | NO   | PRI | NULL                | auto_increment |
| user_id      | varchar(255) | YES  | MUL | NULL                |                |
| post         | text         | NO   |     | NULL                |                |
| post_created | datetime     | YES  |     | current_timestamp() |                |
| anonymous    | tinyint(1)   | YES  |     | 0                   |                |
| vote         | int(11)      | YES  |     | 0                   |                |
| root_post    | int(11)      | YES  | MUL | NULL                |                |

### Table: users

| Field    | Type         | Null | Key | Default | Extra |
|----------|--------------|------|-----|---------|-------|
| user_id  | varchar(255) | NO   | PRI | NULL    |       |
| password | varchar(255) | NO   |     | NULL    |       |
| role     | varchar(255) | YES  |     | NULL    |       |

## Setup

1. Install Node.js and MariaDB.

2. Create a MariaDB database named `let_it_flow`.

3. Run the provided SQL commands in your MariaDB shell to create and describe the tables.

4. Update your database information in `server.js`.

## Running the Server

1. Open your terminal.

2. Navigate to the project directory.

3. Run the following command:

   ```bash
   node server.js
   ```

This will start the Let-It-Flow platform. Access it through your web browser.

Please ensure security best practices when handling sensitive data.

Feel free to contribute and modify the project as needed!
