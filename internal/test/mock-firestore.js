const Firestore = function () {
    var entity = {};
    entity.collection = collection;
    return {
        entity: entity
    };

}();

// mock events data - for a real solution this data should be coming 
// from a cloud data store
const mockEvents = [
    {
        id: 1,
        data: function () {
            return { title: 'an event', id: 1, description: 'something really cool', location: 'Joes pizza', likes: 0 };
        }
    },
    {
        id: 2,
        data: function () {
            return { title: 'another event', id: 2, description: 'something even cooler', location: 'Johns pizza', likes: 0 };
        }
    },

];

const snapshot = {
    docs: mockEvents,
    empty: false
}

const collection = {
    doc: function(id) {
        return {
            get: function() {
                return mockEvents.find(x => x.id === id)
            }
        }
    },
    add: function (arg) {
        return Promise.resolve(snapshot);
    },   
    update: function (arg) {
        return Promise.resolve(snapshot);
    },   
    get: function () {
        return Promise.resolve(snapshot);
    }
};

module.exports = Firestore;
