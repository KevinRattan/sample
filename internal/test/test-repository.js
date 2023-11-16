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
   
    it('should return mock data when no db ', async function () {
        const data = await repo.getEvents();
        expect(data.events.length).to.equal(2);
        expect(data.events[0].id).to.equal(1);
        expect(data.events[0].title).to.equal("a mock event");
    });

});


describe('Testing Get Event returns mock data ', function () {
    it('should return mock data when no db ', async function () {
        const data = await repo.getEvent(1);
        expect(data.id).to.equal(1);
        expect(data.title).to.equal("a mock event");
    });

});



describe('Testing Add Event with mock data', function () {
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
    });

    it('should add mock data when no db and return id', async function () {
        const data = await repo.addEvent(request);
        expect(data).to.be.a('number');
    });

    it('should ignore passed id and set id to length of arrray', async function () {
        const data = await repo.addEvent(request);
        expect(data).to.equal(4);
    });


});

describe('Testing Update Event with mock data', function () {

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
    });

    it('should return success when event updated', async function () {
        const data = await repo.updateEvent(request);
        expect(data.result).to.equal('success');
    });

});


describe('Testing Un-Like Event', function () {


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


});

describe('Testing Like Event', function () {
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
});



describe('Testing Delete Event with mock data', function () {
    

    it('should return id when event deleted', async function () {
        const data = await repo.deleteEvent(2);
        expect(data).to.equal(2);
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
        await repo.getEvents( db);
        // console.log('fakeQuery was called with:', fakeQuery.getCall(0).args);
        sinon.assert.calledWith(fakeQuery, expectedQuery);
    });

});

describe('Testing Get Event with db ', function () {
    let fakeQuery, fakeCreateConnection, connectionStub, expectedQuery, expectedParams, id;
    beforeEach(function () {
        id = 1
        expectedQuery = 'SELECT id, title, description, location, likes, datetime_added FROM events WHERE id = ?;';
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

        fakeQuery = sinon.fake.resolves({ result: 'success'});
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

        fakeQuery = sinon.fake.resolves({ result: 'success'});
        fakeCreateConnection = sinon.fake.resolves({ query: fakeQuery, end: sinon.fake() });
        connectionStub = sinon.stub(db, 'createConnection').callsFake(fakeCreateConnection);

    });

    afterEach(function () {
        connectionStub.restore();
    });

    it('should delete event using correct sql and arguments ', async function () {
        await repo.deleteEvent(2, db);
        // console.log('fakeQuery was called with:', fakeQuery.getCall(0).args);
        sinon.assert.calledWith(fakeQuery, expectedQuery, expectedParams);
    });
} );



describe('Testing Un-Like Event with Db ', function () {
    let fakeQuery, fakeCreateConnection, connectionStub, request, expectedQuery, expectedParams;

    beforeEach(function () {

        expectedQuery = 'UPDATE events SET likes = likes - 1 WHERE id = ? AND likes > 0;';
        expectedParams = 2;
        expectedQuery2 = 'SELECT id, title, description, location, likes, datetime_added FROM events WHERE id = ?;';

        fakeQuery = sinon.fake.resolves({ result: 'success'});
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

        fakeQuery = sinon.fake.resolves({ result: 'success'});
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

