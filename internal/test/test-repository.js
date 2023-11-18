const chai = require('chai');
const sinon = require('sinon');
const repo = require('../repository');
const db = require('mariadb');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const mockEvents = [
    { id: 1, title: 'a mocked event', description: 'something really cool', location: 'Chez Joe Pizza', likes: 0, datetime_added: '2022-02-01:12:00' },
    { id: 2, title: 'another mocked event', description: 'something even cooler', location: 'Chez John Pizza', likes: 0, datetime_added: '2022-02-01:12:00' },
];


describe('Testing Get Events returning mock data ', function () {

    let spy;
    beforeEach(function () {

        // Create a spy for console.log
        spy = sinon.spy(console, 'log');
    }
    );

    afterEach(function () {
        // Always restore the spy after each test to avoid affecting other tests
        spy.restore();
    });

    it('should return mock data when no db ', async function () {
        const data = await repo.getEvents();
        expect(data.events.length).to.equal(2);
        expect(data.events[0].id).to.equal(1);
        expect(data.events[0].title).to.equal("a mock event");
    });

    it('should revert to mock data when no db present ', async function () {
        await repo.getEvents();
        sinon.assert.calledWith(spy.getCall(0), 'no connection - using mock data');
    });

});


describe('Testing Get Event returns mock data ', function () {

    let spy;
    beforeEach(function () {

        // Create a spy for console.log
        spy = sinon.spy(console, 'log');
    }
    );

    afterEach(function () {
        // Always restore the spy after each test to avoid affecting other tests
        spy.restore();
    });
    it('should return mock data when no db ', async function () {
        const data = await repo.getEvent(1);
        expect(data.id).to.equal(1);
        expect(data.title).to.equal("a mock event");
    });

    it('should revert to mock data when no db present ', async function () {
        await repo.getEvent(1);
        sinon.assert.calledWith(spy.getCall(0), 'no connection - using mock data');
    });

});



describe('Testing Add Event with mock data', function () {
    let spy;
    beforeEach(function () {
        request = {
            body: {
                title: 'new',
                description: 'event',
                location: 'somewhere',
                id: 5,
                likes: 0
            }
        }

             // Create a spy for console.log
             spy = sinon.spy(console, 'log');
    });

    afterEach(function () {
        // Always restore the spy after each test to avoid affecting other tests
        spy.restore();
    });


    it('should add mock data when no db and return id', async function () {
        const data = await repo.addEvent(request);
        expect(data).to.be.a('number');
    });

    it('should ignore passed id and set id to length of arrray', async function () {
        const data = await repo.addEvent(request);
        expect(data).to.equal(4);
    });

    it('should revert to mock data when no db present ', async function () {
        await repo.addEvent(request);
        sinon.assert.calledWith(spy.getCall(1), 'no connection - using mock data');
    });

});

describe('Testing Update Event with mock data', function () {

    let spy;
    beforeEach(function () {
        request = {
            body: {
                title: 'updated',
                description: 'event',
                location: 'somewhere else',
                id: 1,
                likes: 0
            }
        }
             // Create a spy for console.log
             spy = sinon.spy(console, 'log');
    });


    afterEach(function () {
        // Always restore the spy after each test to avoid affecting other tests
        spy.restore();
    });

    it('should return success when event updated', async function () {
        const data = await repo.updateEvent(request);
        expect(data.result).to.equal('success');
    });


    it('should revert to mock data when no db present ', async function () {
        await repo.updateEvent(request);
        sinon.assert.calledWith(spy.getCall(1), 'no connection - using mock data');
    });

});


describe('Testing Un-Like Event', function () {

    let spy;
    beforeEach(function () {

        // Create a spy for console.log
        spy = sinon.spy(console, 'log');
    }
    );

    afterEach(function () {
        // Always restore the spy after each test to avoid affecting other tests
        spy.restore();
    });

    it('should never go below 0 likes for event ', async function () {
        let data = await repo.removeLike(1);
        data = await repo.removeLike(1);
        data = await repo.removeLike(1);
        data = await repo.removeLike(1);
        data = await repo.removeLike(1);
        data = await repo.removeLike(1);
        expect(data.likes).to.equal(0);
    });

    it('should decrement likes for event ', async function () {
        let data = await repo.addLike(1);
        expect(data.likes).to.equal(1);
        data = await repo.removeLike(1);
        expect(data.likes).to.equal(0);
    });


    it('should revert to mock data when no db present ', async function () {
        await repo.removeLike(1);
        sinon.assert.calledWith(spy.getCall(3), 'no connection - using mock data');
    });

});

describe('Testing Like Event', function () {
    let spy;
    beforeEach(function () {

        // Create a spy for console.log
        spy = sinon.spy(console, 'log');
    }
    );

    afterEach(function () {
        // Always restore the spy after each test to avoid affecting other tests
        spy.restore();
    });

    it('should increment likes for event ', async function () {
        const data = await repo.addLike(1);
        expect(data.likes).to.equal(1);
    });

    it('should increment likes for event every time it is called ', async function () {
        let data = await repo.addLike(2);
        expect(data.likes).to.equal(1);
        data = await repo.addLike(2);
        expect(data.likes).to.equal(2);
    });

    it('should revert to mock data when no db present ', async function () {
        await repo.addLike(2);
        sinon.assert.calledWith(spy.getCall(3), 'no connection - using mock data');
    });
});


describe('Testing Delete Event with mock data', function () {

    let spy;
    beforeEach(function () {

        // Create a spy for console.log
        spy = sinon.spy(console, 'log');
    }
    );

    afterEach(function () {
        // Always restore the spy after each test to avoid affecting other tests
        spy.restore();
    });


    it('should return id when event deleted and use mock db when no connection ', async function () {
        const data = await repo.deleteEvent(2);
        expect(data).to.equal(2);
        sinon.assert.calledWith(spy.getCall(2), 'no connection - using mock data');
    });


});

describe('Testing Get Comments with mock data', function () {
    let spy;
    beforeEach(function () {

        // Create a spy for console.log
        spy = sinon.spy(console, 'log');
    }
    );

    afterEach(function () {
        // Always restore the spy after each test to avoid affecting other tests
        spy.restore();
    });

    it('should return comments for event ', async function () {
        const data = await repo.getComments(1);
        expect(data.length).to.equal(2);
        expect(data[0].id).to.equal(1);
        expect(data[0].comment).to.equal("this is a comment");
    });


    it('should revert to mock data when no db present ', async function () {
        const data = await repo.getComments(1);
        sinon.assert.calledWith(spy.getCall(0), 'no connection - using mock data');
    });
});


// create a test for adding comments for a given eevent using mock data 
describe('Testing Add Comments with mock data', function () {
    let spy;
    beforeEach(function () {
        request = {
            body: {
                event_id: 1,
                comment: 'this is a comment',
                id: 5
            }
        }
        // Create a spy for console.log
        spy = sinon.spy(console, 'log');
    }
    );

    afterEach(function () {
        // Always restore the spy after each test to avoid affecting other tests
        spy.restore();
    });

    // create the asserts or expectations for the test
    it('should add comment to event ', async function () {
        const data = await repo.addComment(request.body.event_id, request.body.comment);
        expect(data).to.be.a('number');
    });


    it('should revert to mock data when no db present ', async function () {
        const data = await repo.addComment(request.body.event_id, request.body.comment);
        sinon.assert.calledWith(spy.getCall(2), 'no connection - using mock data');
    });
});

// create a test of deleting comments for a given event using mock data
describe('Testing Delete Comments with mock data', function () {

    let spy;
    beforeEach(function () {
        // Create a spy for console.log
        spy = sinon.spy(console, 'log');
    }
    );

    afterEach(function () {
        // Always restore the spy after each test to avoid affecting other tests
        spy.restore();
    });


    it('should return id when comment deleted', async function () {
        const data = await repo.deleteComment(1, 1);
        expect(data).to.equal(1);
    });

    it('should revert to mock data when no db present ', async function () {
        // Create a spy for console.log
 
        const data = await repo.deleteComment(1, 1);

            // Check if console.log was called with a specific message
        sinon.assert.calledWith(spy.getCall(1), 'no connection - using mock data');


    });
});



describe('Testing Get Events with db ', function () {
    let fakeQuery, fakeCreateConnection, connectionStub, expectedQuery;
    beforeEach(function () {
        expectedQuery = 'SELECT id, title, description, location, likes, datetime_added FROM events;';
        fakeQuery = sinon.fake.resolves(mockEvents);
        fakeCreateConnection = sinon.fake.resolves({ query: fakeQuery, end: sinon.fake() });
        connectionStub = sinon.stub(db, 'createConnection').callsFake(fakeCreateConnection);
    });

    afterEach(function () {
        connectionStub.restore();
    });


    it('should use a SQL select query ', async function () {
        await repo.getEvents(db);
        // console.log('fakeQuery was called with:', fakeQuery.getCall(0).args);
        sinon.assert.calledWith(fakeQuery, expectedQuery);
    });

});

describe('Testing Get Event with db ', function () {
    let fakeQuery, fakeCreateConnection, connectionStub, expectedQuery, expectedParams, id;
    beforeEach(function () {
        id = 1
        expectedQuery = 'SELECT e.id, e.title, e.description, e.location, e.likes, e.datetime_added, c.comment, c.id as comment_id FROM events e LEFT OUTER JOIN comments c ON e.id = c.event_id WHERE e.id = ?;';
        expectedParams = id;
        fakeQuery = sinon.fake.resolves(mockEvents);
        fakeCreateConnection = sinon.fake.resolves({ query: fakeQuery, end: sinon.fake() });
        connectionStub = sinon.stub(db, 'createConnection').callsFake(fakeCreateConnection);
    });

    afterEach(function () {
        connectionStub.restore();
    });


    it('should use a SQL select query ', async function () {
        await repo.getEvent(id, db);
        // console.log('fakeQuery was called with:', fakeQuery.getCall(0).args);
        sinon.assert.calledWith(fakeQuery, expectedQuery, expectedParams);
    });

});



describe('Testing Add Event with Db', function () {
    let fakeQuery, fakeCreateConnection, connectionStub, request, expectedQuery, expectedParams;

    beforeEach(function () {
        request = {
            body: {
                title: 'new',
                description: 'event',
                location: 'somewhere',
                id: 5,
                likes: 0
            }
        }
        expectedQuery = 'INSERT INTO events (title, description, location) VALUES (?,?,?) RETURNING id;';
        expectedParams = [request.body.title, request.body.description, request.body.location];

        fakeQuery = sinon.fake.resolves(4);
        fakeCreateConnection = sinon.fake.resolves({ query: fakeQuery, end: sinon.fake() });
        connectionStub = sinon.stub(db, 'createConnection').callsFake(fakeCreateConnection);

    });

    afterEach(function () {
        connectionStub.restore();
    });


    it('should add event use correct sql and arguments ', async function () {
        await repo.addEvent(request, db);
        // console.log('fakeQuery was called with:', fakeQuery.getCall(0).args);
        sinon.assert.calledWith(fakeQuery, expectedQuery, expectedParams);
    });

});


describe('Testing Update Event with Db', function () {
    let fakeQuery, fakeCreateConnection, connectionStub, request, expectedQuery, expectedParams;

    beforeEach(function () {
        request = {
            body: {
                title: 'new',
                description: 'event',
                location: 'somewhere',
                id: 1,
                likes: 0
            }
        }
        expectedQuery = 'UPDATE events SET title = ?, description = ?, location = ? WHERE id = ?;';
        expectedParams = [request.body.title, request.body.description, request.body.location, request.body.id];

        fakeQuery = sinon.fake.resolves({ result: 'success' });
        fakeCreateConnection = sinon.fake.resolves({ query: fakeQuery, end: sinon.fake() });
        connectionStub = sinon.stub(db, 'createConnection').callsFake(fakeCreateConnection);

    });

    afterEach(function () {
        connectionStub.restore();
    });


    it('should update event use correct sql and arguments ', async function () {
        await repo.updateEvent(request, db);
        // console.log('fakeQuery was called with:', fakeQuery.getCall(0).args);
        sinon.assert.calledWith(fakeQuery, expectedQuery, expectedParams);
    });

});



describe('Testing Delete Event with Db', function () {
    let fakeQuery, fakeCreateConnection, connectionStub, request, expectedQuery, expectedParams;

    beforeEach(function () {

        expectedQuery = 'DELETE FROM events WHERE id = ?;';
        expectedParams = 2;

        fakeQuery = sinon.fake.resolves({ result: 'success' });
        fakeCreateConnection = sinon.fake.resolves({ query: fakeQuery, end: sinon.fake() });
        connectionStub = sinon.stub(db, 'createConnection').callsFake(fakeCreateConnection);

    });

    afterEach(function () {
        connectionStub.restore();
    });

    it('should delete event using correct sql and arguments ', async function () {
        await repo.deleteEvent(2, db);
        // console.log('fakeQuery was called with:', fakeQuery.getCall(0).args);
        sinon.assert.calledWith(fakeQuery.getCall(1), expectedQuery, expectedParams);
    });
});



describe('Testing Un-Like Event with Db ', function () {
    let fakeQuery, fakeCreateConnection, connectionStub, request, expectedQuery, expectedParams;

    beforeEach(function () {

        expectedQuery = 'UPDATE events SET likes = likes - 1 WHERE id = ? AND likes > 0;';
        expectedParams = 2;
        expectedQuery2 = 'SELECT id, title, description, location, likes, datetime_added FROM events WHERE id = ?;';

        fakeQuery = sinon.fake.resolves({ result: 'success' });
        fakeCreateConnection = sinon.fake.resolves({ query: fakeQuery, end: sinon.fake() });
        connectionStub = sinon.stub(db, 'createConnection').callsFake(fakeCreateConnection);

    });

    afterEach(function () {
        connectionStub.restore();
    });


    it('should decrement likes for event ', async function () {
        await repo.removeLike(2, db);
        sinon.assert.calledWith(fakeQuery.getCall(0), expectedQuery, expectedParams);
        sinon.assert.calledWith(fakeQuery.getCall(1), expectedQuery2, expectedParams);
    });


});


describe('Testing Like Event with Db ', function () {
    let fakeQuery, fakeCreateConnection, connectionStub, request, expectedQuery, expectedParams;

    beforeEach(function () {

        expectedQuery = 'UPDATE events SET likes = likes + 1 WHERE id = ?;';
        expectedQuery2 = 'SELECT id, title, description, location, likes, datetime_added FROM events WHERE id = ?;';
        expectedParams = 2;

        fakeQuery = sinon.fake.resolves({ result: 'success' });
        fakeCreateConnection = sinon.fake.resolves({ query: fakeQuery, end: sinon.fake() });
        connectionStub = sinon.stub(db, 'createConnection').callsFake(fakeCreateConnection);

    });

    afterEach(function () {
        connectionStub.restore();
    });


    it('should increment likes for event ', async function () {
        await repo.addLike(2, db);
        sinon.assert.calledWith(fakeQuery.getCall(0), expectedQuery, expectedParams);
        sinon.assert.calledWith(fakeQuery.getCall(1), expectedQuery2, expectedParams);
    });

});

// create a test for getting comments for an individual event using the database
describe('Testing Get Comments with Db', function () {
    let fakeQuery, fakeCreateConnection, connectionStub, expectedQuery, expectedParams, id;
    beforeEach(function () {
        id = 1
        expectedQuery = 'SELECT id, event_id, comment FROM comments WHERE event_id = ?;';
        expectedParams = id;
        fakeQuery = sinon.fake.resolves(mockEvents);
        fakeCreateConnection = sinon.fake.resolves({ query: fakeQuery, end: sinon.fake() });
        connectionStub = sinon.stub(db, 'createConnection').callsFake(fakeCreateConnection);
    });

    afterEach(function () {
        connectionStub.restore();
    });
    // create the asserts or expectations for the test
    it('should use a SQL select query ', async function () {
        await repo.getComments(id, db);
        // console.log('fakeQuery was called with:', fakeQuery.getCall(0).args);
        sinon.assert.calledWith(fakeQuery, expectedQuery, expectedParams);
    });

});

// create a test for adding a comment for a given event using the database by checking the sql statement
describe('Testing Add Comments with Db', function () {
    let fakeQuery, fakeCreateConnection, connectionStub, request, expectedQuery, expectedParams, event_id, comment;

    beforeEach(function () {
        event_id = 1;
        comment = 'this is a comment';
        expectedQuery = 'INSERT INTO comments (comment, event_id) VALUES (?,?) RETURNING id;';
        expectedParams = [comment, event_id];

        fakeQuery = sinon.fake.resolves(4);
        fakeCreateConnection = sinon.fake.resolves({ query: fakeQuery, end: sinon.fake() });
        connectionStub = sinon.stub(db, 'createConnection').callsFake(fakeCreateConnection);

    });

    afterEach(function () {
        connectionStub.restore();
    });
    // add teh asserts or expectations for the test
    it('should add comment to event ', async function () {
        await repo.addComment(event_id, comment, db);
        // console.log('fakeQuery was called with:', fakeQuery.getCall(0).args);
        sinon.assert.calledWith(fakeQuery, expectedQuery, expectedParams);
    });
});

describe('Testing Delete Comments with Db', function () {
    let fakeQuery, fakeCreateConnection, connectionStub, request, expectedQuery, expectedParams;

    beforeEach(function () {
        request = {
            body: {
                event_id: 1,
                id: 5
            }
        }
        expectedQuery = 'DELETE FROM comments WHERE id = ?;';
        expectedParams = request.body.id;

        fakeQuery = sinon.fake.resolves(5);
        fakeCreateConnection = sinon.fake.resolves({ query: fakeQuery, end: sinon.fake() });
        connectionStub = sinon.stub(db, 'createConnection').callsFake(fakeCreateConnection);

    });

    afterEach(function () {
        connectionStub.restore();
    });
    // add teh asserts or expectations for the test
    it('should delete comment from event ', async function () {
        // Create a spy for console.log
     
        await repo.deleteComment(request.body.event_id, request.body.id, db);
        // console.log('fakeQuery was called with:', fakeQuery.getCall(0).args);
        sinon.assert.calledWith(fakeQuery, expectedQuery, expectedParams);
     
    });
});
