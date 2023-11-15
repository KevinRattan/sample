// Going to connect to MySQL database
const mariadb = require('mariadb');

const HOST = process.env.DBHOST ? process.env.DBHOST : "localhost";
const USER = process.env.DBUSER ? process.env.DBUSER : "events_user";
const PASSWORD = process.env.DBPASSWORD ? process.env.DBPASSWORD : "letmein!";
const DATABASE = process.env.DBDATABASE ? process.env.DBDATABASE : "events_db";

async function getConnection(db) {
    try {
        return await db.createConnection(
            {
                host: HOST,
                user: USER,
                password: PASSWORD,
                database: DATABASE
            });
    }
    catch (err) {
        console.log("no connection - using mock data");
        // uncomment this line to help see why connection is failing.
        // console.log(err);
        return null;
    }

}

// mock events data - Once deployed the data will come from database
const mockEvents = {
    events: [
        { id: 1, title: 'a mock event', description: 'something really cool', location: 'Chez Joe Pizza', likes: 0, datetime_added: '2022-02-01:12:00' },
        { id: 2, title: 'another mock event', description: 'something even cooler', location: 'Chez John Pizza', likes: 0, datetime_added: '2022-02-01:12:00' },
    ]
};

const dbEvents = { events: [] };

async function getEvents(db = mariadb) {
    const conn = await getConnection(db);
    if (conn) {
        const sql = 'SELECT id, title, description, location, likes, datetime_added FROM events;';
        return conn.query(sql)
            .then(rows => {
                console.log("retrieved all events");
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
                //handle query error
                console.log(err);
                if (conn && conn.destroy) {
                    conn.destroy();
                }
                return mockEvents;
            });
    }
    else {
        return mockEvents;
    }

};

async function getEvent(id, db = mariadb) { 
    const conn = await getConnection(db);
    if (conn) {
        const sql = 'SELECT id, title, description, location, likes, datetime_added FROM events WHERE id = ?;';
        return conn.query(sql, id)
            .then(rows => {
                console.log("retrieved event");
                const row = rows[0];
                conn.end();
                return row;
            })
            .catch(err => {
                //handle query error
                console.log(err);
                if (conn && conn.destroy) {
                    conn.destroy();
                }
                return mockEvents.events.find((obj => obj.id == id));
            });
    }
    else {
        return mockEvents.events.find((obj => obj.id == id));
    }
}



// create a function to udpate an event
async function updateEvent(req, db = mariadb) { 

    const ev = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        id: req.body.id
    }
    const sql = 'UPDATE events SET title = ?, description = ?, location = ? WHERE id = ?;';
    const values = [ev.title, ev.description, ev.location, ev.id];
    const conn = await getConnection(db);
    if (conn) {
        conn.query(sql, values)
            .then(() => {
                console.log("updated event");
                conn.end();
                return { result: "success"};;
            })
            .catch(err => {
                console.log(err);
                updateMock(ev);
                if (conn && conn.destroy) {
                    conn.destroy();
                }
                return { result: "error"};
            });
    }
    else {
        updateMock(ev);
        return { result: "success"};
    }
}

function updateMock(ev) { 
    const objIndex = mockEvents.events.findIndex((obj => obj.id == ev.id));
    mockEvents.events[objIndex] = {...mockEvents.events[objIndex], ...ev};  
    console.log("updated mock event");
    // return mockEvents.events[objIndex];
}



async function addEvent(req, db = mariadb) {
    // create a new object from the json data and add an id
    const ev = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        id: mockEvents.events.length + 1,
        likes: 0,
        datetime_added: new Date().toUTCString()
    }
    const sql = 'INSERT INTO events (title, description, location) VALUES (?,?,?) RETURNING id;';
    const values = [ev.title, ev.description, ev.location];
    const conn = await getConnection(db);
    if (conn) {
        conn.query(sql, values)
            .then((id) => {
                conn.end();
                console.log("inserted event with id ", id);
                return {id};
            })
            .catch(err => {
                console.log(err);
                mockEvents.events.push(ev);
                if (conn && conn.destroy) {
                    conn.destroy();
                }
                return ev.id;
            });
    }
    else {
        console.log("mock event added: ", ev);
        mockEvents.events.push(ev);
        return ev.id;
    }
};


//create a function to delete an event that deletes a mock event if there is no database connection
async function deleteEvent(id, db = mariadb) {
    const sql = 'DELETE FROM events WHERE id = ?;';
    const conn = await getConnection(db);
    if (conn) {
        conn.query(sql, id)
            .then(() => {
                conn.end();
                return id;
            })
            .catch(err => {
                console.log(err);
                if (conn && conn.destroy) {
                    conn.destroy();
                }
                return deleteMock(id);
            });
    }   
    else {
        return deleteMock(id);
    }
}


function deleteMock(id) {
    const objIndex = mockEvents.events.findIndex((obj => obj.id == id));
    mockEvents.events.splice(objIndex, 1);
    return id;
}



function cleanUpLike(err, conn, id, increment) {
    console.log(err);
    const objIndex = mockEvents.events.findIndex((obj => obj.id == id));
    let likes = mockEvents.events[objIndex].likes;
    if (increment) {
        mockEvents.events[objIndex].likes = ++likes;
    }
    else if (likes > 0) {
        mockEvents.events[objIndex].likes = --likes;
    }
    if (conn && conn.destroy) {
        conn.destroy();
    }
    // console.log("event is ", mockEvents.events[objIndex]);
    return mockEvents.events[objIndex].likes;
}

// function used by both like and unlike. If increment = true, a like is added.
// If increment is false, a like is removed.
async function changeLikes(id, increment, db = mariadb) {
    const get_likes_sql = `SELECT likes from events WHERE id = ?;`
    const update_sql = `UPDATE events SET likes = ? WHERE id = ?`;
    const conn = await getConnection(db);
    if (conn) {
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
                return total;
            })
            .catch(err => {
                return cleanUpLike(err, conn, id, increment);
            });

    }
    else {
        return cleanUpLike("no connection", conn, id, increment);
    }

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
        getEvent, getEvent,
        addEvent: addEvent,
        updateEvent: updateEvent,
        deleteEvent: deleteEvent,   
        addLike: addLike,
        removeLike: removeLike
    };
}();

module.exports = eventRepository;