CREATE TABLE rounds (
    id SERIAL PRIMARY KEY,
    is_active BOOLEAN DEFAULT TRUE,
    drawn_numbers INTEGER[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    round_id INT REFERENCES rounds(id),
    identification_number VARCHAR(20) NOT NULL,
    numbers INTEGER[],
    uuid UUID DEFAULT gen_random_uuid(),
    user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  sub VARCHAR NOT NULL UNIQUE,
  nickname VARCHAR,
  name VARCHAR,
  picture VARCHAR,
  updated_at TIMESTAMP,
  email VARCHAR NOT NULL,
  email_verified BOOLEAN,
  
);