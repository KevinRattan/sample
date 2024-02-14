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

//  a mock array of comments for each mock event
mockEvents.events.forEach((ev) => {
    ev.comments = [
        { id: 1, event_id: ev.id, comment: 'this is a comment' },
        { id: 2, event_id: ev.id, comment: 'this is another comment' }
    ]
});


const dbEvents = { events: [] };

async function getEvents(db = mariadb) {
    const conn = await getConnection(db);
    if (conn) {
        const sql = 'SELECT id, title, description, location, likes, datetime_added FROM events;';
        console.log(sql);
        return conn.query(sql)
            .then(rows => {
                console.log("retrieved all events from db");
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
                handleError(err, conn);
                console.log("Returned all mock events");
                return mockEvents;
            });
    }
    else {
        console.log("Returned all mock events");
        return mockEvents;
    }

};

async function getEvent(id, db = mariadb) {
    const conn = await getConnection(db);
    if (conn) {
        const sql = 'SELECT e.id, e.title, e.description, e.location, e.likes, e.datetime_added, c.comment, c.id as comment_id FROM events e LEFT OUTER JOIN comments c ON e.id = c.event_id WHERE e.id = ?;';
        console.log(sql);
        return conn.query(sql, id)
            .then(rows => {
                console.log("retrieved event with id", id);
                const ev = { 
                    title:rows[0].title,
                    description:rows[0].description,
                    location:rows[0].location,
                    id:rows[0].id,
                    likes:rows[0].likes,
                    datetime_added:rows[0].datetime_added,
                    comments : []
                }
                rows.forEach((row) => {
                    if (row.comment) {
                        const comment = {
                            id: row.comment_id,
                            event_id: row.id,
                            comment: row.comment
                        };
                        ev.comments.push(comment);
                    }
                });
                conn.end();
                return ev;
            })
            .catch(err => {
                handleError(err, conn);
                return mockEvents.events.find((obj => obj.id == id));
            });
    }
    else {
        return mockEvents.events.find((obj => obj.id == id));
    }
}


// create a function to return all comments for an event by its id 
async function getComments(id, db = mariadb) {
    const conn = await getConnection(db);
    if (conn) {
        const sql = 'SELECT id, event_id, comment FROM comments WHERE event_id = ?;';
        console.log(sql);
        return conn.query(sql, id)
            .then(rows => {
                console.log("retrieved comments for event with id", id);
                conn.end();
                return rows;
            })
            .catch(err => {
                handleError(err, conn);
                return mockEvents.events.find((obj => obj.id == id)).comments;
            });
    }
    else {
        return mockEvents.events.find((obj => obj.id == id)).comments;
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
    console.log(sql);
    const values = [ev.title, ev.description, ev.location, ev.id];
    const conn = await getConnection(db);
    if (conn) {
        conn.query(sql, values)
            .then(() => {
                console.log("Updated event with id ", ev.id);
                conn.end();
                return { result: "success" };;
            })
            .catch(err => {
                handleError(err, conn);
                updateMock(ev);
                return { result: "error" };
            });
    }
    else {
        updateMock(ev);
        return { result: "success" };
    }
}

function updateMock(ev) {
    const objIndex = mockEvents.events.findIndex((obj => obj.id == ev.id));
    mockEvents.events[objIndex] = { ...mockEvents.events[objIndex], ...ev };
    console.log("updated mock event with id", ev.id);
    // return mockEvents.events[objIndex];
}



async function addEvent(req, db = mariadb) {
    // create a new object from the json data and add an id
    const ev = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        id: -1,
        likes: 0,
        datetime_added: new Date().toUTCString()
    }
    const sql = 'INSERT INTO events (title, description, location) VALUES (?,?,?) RETURNING id;';
    console.log(sql);
    const values = [ev.title, ev.description, ev.location];
    const conn = await getConnection(db);
    if (conn) {
        conn.query(sql, values)
            .then((id) => {
                conn.end();
                console.log("inserted event with id ", id);
                return { id };
            })
            .catch(err => {
                handleError(err, conn);
                return addMockEvent(ev);
            });
    }
    else {
        return addMockEvent(ev);

    }
};

function addMockEvent(ev) {
    ev.id =  mockEvents.events.length + 1;
    mockEvents.events.push(ev);
    console.log("mock event added: ", ev);
    return ev.id;
}


async function addComment(event_id, comment, db = mariadb) {
    const sql = 'INSERT INTO comments (comment, event_id) VALUES (?,?) RETURNING id;';
    console.log(sql);
    const values = [comment, event_id];
    console.log("adding comment to  event with id ", event_id);
    const conn = await getConnection(db);
    if (conn) {
        conn.query(sql, values)
            .then((id) => {
                conn.end();
                console.log("inserted comment with id ", id);
                return { id };
            })
            .catch(err => {
                handleError(err, conn);
                addMockComment(event_id, comment);
                return comment.id;
            });
    }
    else {
       return addMockComment(event_id, comment);
    }
}

function addMockComment(event_id, com) {
    const objIndex = mockEvents.events.findIndex((obj => obj.id == event_id));
    const mockEvent =  mockEvents.events[objIndex];
    mockEvent.comments = mockEvent.comments ? mockEvent.comments : [];
    const comment = {
        comment: com,
        event_id: event_id,
        id:  mockEvent.comments.length + 1
    }
    mockEvent.comments.push(comment);
    console.log("mock comment added: ", comment);
    return comment.id;
}

// create a delete comment function that takes an id and db and deletes the comment
async function deleteComment(event_id, id, db = mariadb) {
    const sql = 'DELETE FROM comments WHERE id = ?;';
    console.log(sql);
    const conn = await getConnection(db);
    if (conn) {
        try {
            await conn.query(sql, id);
            conn.end();
            console.log("deleted comment with id ", id);
            return id;
        }
        catch(err) {
            handleError(err, conn);
            return deleteMockComment(event_id, id);
        }
    }
    else {
        return deleteMockComment(event_id, id);
    }
}

function deleteMockComment(event_id, id) {
    const objIndex = mockEvents.events.findIndex((obj => obj.id == event_id));
    const commentIndex = mockEvents.events[objIndex].comments.findIndex((obj => obj.id == id));
    mockEvents.events[objIndex].comments.splice(commentIndex, 1);
    console.log("mock comment deleted: ", id);
    return id;
}

async function deleteEvent(id, db = mariadb) {
    const sql = 'DELETE FROM events WHERE id = ?;';
    console.log(sql);
    const sql2 = 'DELETE FROM comments where event_id = ?;';
    console.log(sql2);
    const conn = await getConnection(db);
    if (conn) {
        try {
            await conn.query(sql2, id);
            await conn.query(sql, id);
            conn.end();
            console.log("deleted event and comments with id ", id);
            return id;
        }
        catch(err) {
            handleError(err, conn);
            return deleteMock(id);
        }
    }
    else {
        return deleteMock(id);
    }
}




function deleteMock(id) {
    const objIndex = mockEvents.events.findIndex((obj => obj.id == id));
    mockEvents.events.splice(objIndex, 1);
    console.log("deleted mock event with id ", id);
    return id;
}



function cleanUpLike(err, conn, id, increment) {
    handleError(err, conn);
    const objIndex = mockEvents.events.findIndex((obj => obj.id == id));
    let likes = mockEvents.events[objIndex].likes;
    if (increment) {
        console.log("added like to mock event with id ", id);
        mockEvents.events[objIndex].likes = ++likes;
    }
    else if (likes > 0) {
        mockEvents.events[objIndex].likes = --likes;
        console.log("added like to mock event with id ", id);
    }
    return mockEvents.events[objIndex];
}



// function used by both like and unlike. If increment = true, a like is added.
// If increment is false, a like is removed.
async function changeLikes(id, increment, db = mariadb) {
    const update_sql = increment ?
        'UPDATE events SET likes = likes + 1 WHERE id = ?;'
        : 'UPDATE events SET likes = likes - 1 WHERE id = ? AND likes > 0;';
    const select_sql = 'SELECT id, title, description, location, likes, datetime_added FROM events WHERE id = ?;';
    console.log(update_sql);
    console.log(select_sql);
    const conn = await getConnection(db);
    if (conn) {
        try {
            await conn.query(update_sql, id);
            const rows = conn.query(select_sql, id);
            const row = rows[0];
            conn.end();
            if (increment) {
                console.log("added like to event with id ", id);
            }
            else {
                console.log("removed like from event with id ", id);
            }
            return row;
        }
        catch (err) {
            console.log(err);
            return cleanUpLike(err, conn, id, increment);
        };
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

function handleError(err, conn) {
    console.log(err);
    if (conn && conn.destroy) { conn.destroy();  }
}

const eventRepository = function () {

    return {
        getEvents: getEvents,
        getEvent, getEvent,
        addEvent: addEvent,
        updateEvent: updateEvent,
        deleteEvent: deleteEvent,
        addLike: addLike,
        removeLike: removeLike,
        getComments: getComments,
        addComment: addComment,
        deleteComment: deleteComment
    };
}();

module.exports = eventRepository;
