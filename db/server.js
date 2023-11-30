'use strict';

// Going to connect to MySQL database
const mariadb = require('mariadb');

const create_table_sql = `CREATE TABLE events(
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    likes INT DEFAULT 0,
    datetime_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ( id )
 );`;

const create_comments_table_sql = `CREATE TABLE comments(
    id INT NOT NULL AUTO_INCREMENT,
    comment TEXT NOT NULL,
    event_id INT NOT NULL,
    datetime_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ( id ),
    FOREIGN KEY (event_id) REFERENCES events(id)
 );`;

 let succeeded = false;
 const HOST = process.env.DBHOST ? process.env.DBHOST : "127.0.0.1";
 const USER = process.env.DBUSER ? process.env.DBUSER : "root";
 const PASSWORD = process.env.DBPASSWORD ? process.env.DBPASSWORD : "letmein!";

 async function getConnection(db) {
    try {
        return await db.createConnection(
            {
                host: HOST,
                user: USER,
                password: PASSWORD
            });
    }
    catch (err) {
        console.log("no connection");
        console.log(err);
        return null;
    }
}


async function init_database() {

    const connection = await getConnection(mariadb);
    if (connection) {
        try {
            console.log("Connected!");
            await runQuery("DROP DATABASE IF EXISTS events_db;", connection);
            console.log("Dropped Database");
            await runQuery("CREATE DATABASE events_db;", connection);  
            console.log("Created Database");
            await runQuery("USE events_db;", connection);
            console.log("Switched Database");
            await runQuery(create_table_sql, connection);
            console.log("Events table created");
            await runQuery(create_comments_table_sql, connection);
            console.log("Comments table created");
            const id1 =  await runQuery("INSERT INTO events (title, description, location) VALUES ('Pet Show Db', 'Super-fun with furry friends!', 'Dog Park')  RETURNING id;", connection);
            console.log("Event added");
            const id2 =  await runQuery("INSERT INTO events (title,  description, location) VALUES ('Company Picnic Db', 'Come for free food and drinks.', 'At the lake')  RETURNING id;", connection);
            console.log("Event added");
            await runQuery("INSERT INTO comments (comment, event_id) VALUES ('This is a db comment on the pet show',?)", connection, id1[0].id);
            console.log("Comment added");
            await runQuery("INSERT INTO comments (comment, event_id) VALUES ('This is a another db comment on the pet show',?)", connection, id1[0].id);
            console.log("Comment added");
            await runQuery("INSERT INTO comments (comment, event_id) VALUES ('This is a db comment on the picnic',?)", connection, id2[0].id);
            console.log("Comment added");
            await runQuery("INSERT INTO comments (comment, event_id) VALUES ('This is a another db comment on the picnic',?)", connection, id2[0].id);
            console.log("Comment added");
            succeeded = true;
            connection.destroy();
        }
        catch (err) {
            console.error(err.message);
            connection.destroy();
        }
        }
}



async function runQuery(sql, connection, params) {
    let result;
    if (params) {
        result = await connection.query(sql, params);
    }
    else {
       result = await connection.query(sql);
    }
    console.log(result);
    return result;
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

let tries = 0;
let sleep_time = 1;
async function start() {
    while (!succeeded && tries < 10) {
        tries++;
        init_database();
        console.log(sleep_time);
        await sleep(sleep_time * 1000);
        sleep_time >= 64 ? sleep_time = sleep_time : sleep_time *= 2
        console.log(new Date().toLocaleTimeString());
    }
    console.log("Exiting");
    process.exit();
}

start();