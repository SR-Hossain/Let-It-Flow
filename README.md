# Let-It-Flow
Mental Care related platform similar to stackOverflow
install nodejs and mysql
MariaDB [let_it_flow]> show tables;
+-----------------------+
| Tables_in_let_it_flow |
+-----------------------+
| posts                 |
| users                 |
+-----------------------+
2 rows in set 

MariaDB [let_it_flow]> describe posts;
+--------------+--------------+------+-----+---------------------+----------------+
| Field        | Type         | Null | Key | Default             | Extra          |
+--------------+--------------+------+-----+---------------------+----------------+
| post_id      | int(11)      | NO   | PRI | NULL                | auto_increment |
| user_id      | varchar(255) | YES  | MUL | NULL                |                |
| post         | text         | NO   |     | NULL                |                |
| post_created | datetime     | YES  |     | current_timestamp() |                |
| anonymous    | tinyint(1)   | YES  |     | 0                   |                |
| vote         | int(11)      | YES  |     | 0                   |                |
| root_post    | int(11)      | YES  | MUL | NULL                |                |
+--------------+--------------+------+-----+---------------------+----------------+
7 rows in set


MariaDB [let_it_flow]> describe users;
+----------+--------------+------+-----+---------+-------+
| Field    | Type         | Null | Key | Default | Extra |
+----------+--------------+------+-----+---------+-------+
| user_id  | varchar(255) | NO   | PRI | NULL    |       |
| password | varchar(255) | NO   |     | NULL    |       |
| role     | varchar(255) | YES  |     | NULL    |       |
+----------+--------------+------+-----+---------+-------+
3 rows in set


change your database information in server.js


then 
```bash
node server.js
```
