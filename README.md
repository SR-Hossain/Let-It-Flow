# Let-It-Flow

Mental Care related platform similar to stackOverflow...

## Prerequisites

- Node.js
- MariaDB

## Database Tables

### Table: posts



```mysql
DELIMITER //
CREATE TRIGGER check_password
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    DECLARE contains_letter BOOLEAN;
    DECLARE contains_digit BOOLEAN;

    SET contains_letter = FALSE;
    SET contains_digit = FALSE;

    -- Check if password contains at least one letter and one digit
    SET @password = NEW.password;

    SELECT @password REGEXP '[a-zA-Z]' INTO contains_letter;
    SELECT @password REGEXP '[0-9]' INTO contains_digit;

    IF LENGTH(@password) < 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Password must be at least 8 characters';
    END IF;

    IF NOT (contains_letter AND contains_digit) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Password must contain both letters and numbers';
    END IF;
END;
//
DELIMITER ;
```

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

```mysql
DELIMITER //
CREATE PROCEDURE insert_user(IN p_user_id VARCHAR(255), IN p_password VARCHAR(255))
BEGIN
    DECLARE user_exists INT;
    SET user_exists = 0;

    -- Check if the user already exists
    SELECT COUNT(*) INTO user_exists FROM users WHERE user_id = p_user_id;

    -- If the user exists, raise an error
    IF user_exists > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User already exists with name ' || p_user_id;
    ELSE
        -- Insert the user
        INSERT INTO users(user_id, password) VALUES (p_user_id, p_password);
    END IF;
END;
//
DELIMITER ;
```


## Table: Reactions

| Field   | Type         | Null | Key | Default | Extra |
|---------|--------------|------|-----|---------|-------|
| user_id | varchar(255) | NO   | PRI | NULL    |       |
| post_id | int(11)      | NO   | PRI | NULL    |       |
| vote    | int(11)      | NO   |     | 0       |       |


```mysql
CREATE TABLE reactions (
  user_id VARCHAR(255) NOT NULL references users on delete cascade,
  post_id INT(11) NOT NULL references posts on delete cascade,
  vote INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, post_id)
);
```


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
