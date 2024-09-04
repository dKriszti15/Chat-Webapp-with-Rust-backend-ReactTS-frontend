use webchat;

CREATE TABLE users (
  user_id UUID PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  admin INT NOT NULL
);

CREATE TABLE files (
  file_id UUID PRIMARY KEY NOT NULL,
  file_path TEXT,
  file_original_name TEXT,
  file_size INT
);

CREATE TABLE file_token (
  file_token UUID PRIMARY KEY NOT NULL,
  file_token_path TEXT,
  file_token_exp TIMESTAMP,
  file_token_current_size INT,
  file_token_max_size INT
);

