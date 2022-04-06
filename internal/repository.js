// Going to connect to MySQL database
const mariadb = require('mariadb');

const HOST = process.env.DBHOST ? process.env.DBHOST : "localhost";
const USER = process.env.DBUSER ? process.env.DBUSER : "events_user";
const PASSWORD = process.env.DBPASSWORD ? process.env.DBPASSWORD : "letmein!";
const DATABASE = process.env.DBDATABASE ? process.env.DBDATABASE : "events_db";

async function getConnection(db) {
    return await db.createConnection(
        {
            host: HOST,
            user: USER,
            password: PASSWORD,
            database: DATABASE
        });

}

// mock events data - Once deployed the data will come from database
const mockEvents = {
    events: [
        { id: 1, title: 'a mock event', description: 'something really cool', location: 'Chez Joe Pizza', likes: 0, datetime_added: '2022-02-01:12:00' },
        { id: 2, title: 'another mock event', description: 'something even cooler', location: 'Chez John Pizza', likes: 0, datetime_added: '2022-02-01:12:00' },
    ]
};

const dbEvents = { events: [] };


function cleanUp(conn, err) {
    //handle query error
    console.log(err);
    if (conn && conn.destroy) {
        conn.destroy();
    }
    return mockEvents;
}

async function getEvents(db = mariadb) {
    const conn = getConnection(db)
    return conn.then(conn => {
        const sql = 'SELECT id, title, description, location, likes, datetime_added FROM events;';
        return conn.query(sql)
            .then(rows => {
                console.log(rows); 
                dbEvents.events = [];
                rows.forEach((row) => {
                    const ev = {
                        title: row.title,
                        description: row.description,
                        location: row.location,
                        id: row.id,
                        likes: row.likes,
                        datetime_added: row.datetime_added
                    };
                    dbEvents.events.push(ev);
                });
                conn.end();
                return dbEvents;
            })
            .catch(err => {
                return cleanUp(conn, err);
            });
    })
        .catch(err => {
            return cleanUp(conn, err);
        });
};


async function addEvent(req, db = mariadb) {
    // create a new object from the json data and add an id
    const ev = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        id: mockEvents.events.length + 1,
    }
    const sql = 'INSERT INTO events (title, description, location) VALUES (?,?,?);';
    const values = [ev.title, ev.description, ev.location];
    const conn = getConnection(db);
    return conn.then(conn => {
        conn.query(sql, values)
            .then(() => {
                conn.end();
                return {};
            })
            .catch(err => {
                //handle query error
                console.log(err);
                mockEvents.events.push(ev);
                if (conn && conn.destroy) {
                    conn.destroy();
                }
                return {};
            });
    })
        .catch(err => {
            return cleanUp();
        });
};


// function used by both like and unlike. If increment = true, a like is added.
// If increment is false, a like is removed.
async function changeLikes(id, increment, db = mariadb) {
    const get_likes_sql = `SELECT likes from events WHERE id = ?;`
    const update_sql = `UPDATE events SET likes = ? WHERE id = ?`;
    const conn = getConnection(db);
    return conn.then(conn => {
        conn.query(get_likes_sql, id)
        .then((rows) => {
            let total = rows[0].likes;
            if (increment) {
                total++;
            }
            else if (total > 0) {
                total--;
            }
            conn.query(update_sql, [total, id])
                .then(() => {
                    if (increment) {
                        console.log("Like added");
                    }
                    else {
                        console.log("Like removed");
                    }
                });
            conn.end();
            return {};
        })
        .catch(err => {
            return cleanUp(conn, err);
        });
    })
    .catch(err => {
        return cleanUp(conn, err);
    });;

}

async function addLike(id) {
    console.log("adding like to = " + id);
    return changeLikes(id, true);
};

async function removeLike(id) {
    console.log("removing like from = " + id);
    return changeLikes(id, false);
};


const eventRepository = function () {

    return {
        getEvents: getEvents,
        addEvent: addEvent,
        addLike: addLike,
        removeLike: removeLike
    };
}();

module.exports = eventRepository;