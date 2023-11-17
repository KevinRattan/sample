DROP DATABASE IF EXISTS events_db;
CREATE DATABASE events_db;

USE events_db;

CREATE TABLE events(
   id INT NOT NULL AUTO_INCREMENT,
   title VARCHAR(255) NOT NULL,
   description TEXT NOT NULL,
   location VARCHAR(255) NOT NULL,
   likes INT DEFAULT 0,
   datetime_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY ( id )
);

SHOW TABLES;

INSERT INTO events (title, description, location) VALUES ('Pet Show Db', 'Super-fun with furry friends!', 'Dog Park');

INSERT INTO events (title,  description, location) VALUES ('Company Picnic Db', 'Come for free food and drinks.', 'At the lake');


SELECT * FROM events;

-- create a database table comments using the id of the events table as a foreign key to link the two tables together
CREATE TABLE comments(
   id INT NOT NULL AUTO_INCREMENT,
   comment TEXT NOT NULL,
   event_id INT NOT NULL,
   datetime_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY ( id ),
   FOREIGN KEY (event_id) REFERENCES events(id)
);
