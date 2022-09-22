const PROJECTID = process.env.GOOGLE_CLOUD_PROJECT ? process.env.GOOGLE_CLOUD_PROJECT : "your-project-id";
const SUBSCRIPTION = process.env.SUBSCRIPTION ? process.env.SUBSCRIPTION : "your-subscription";
// Imports the Google Cloud client library. v1 is for the lower level
// proto access.
const { v1 } = require('@google-cloud/pubsub');
// Creates a client; cache this for further use.
const subClient = new v1.SubscriberClient();
// The low level API client requires a name only.
const formattedSubscription = subClient.subscriptionPath(PROJECTID, SUBSCRIPTION);


const pubsubRepository = (function () {

   const synchronousPull = async function() {

        // The maximum number of messages returned for this request.
        // Pub/Sub may return fewer than the number specified.
        const request = {
            subscription: formattedSubscription,
            maxMessages: 1,
        };

        // The subscriber pulls a specified number of messages.
        const [response] = await subClient.pull(request);

        // Process the messages.
        const messages = [];
        for (const message of response.receivedMessages) {
            console.log(`Received message: ${message.message.data}`);
            messages.push({ image: message.message.attributes.image, ackId: message.ackId })
        }
        return messages;
    }


    const acknowledgeApproval = async function(ackIds = []) {
        if (ackIds.length !== 0) {
            // Acknowledge all of the messages. You could also acknowledge
            // these individually, but this is more efficient.
            const ackRequest = {
                subscription: formattedSubscription,
                ackIds: ackIds,
            };

            await subClient.acknowledge(ackRequest);
        }
    }


    return {
        synchronousPull,
        acknowledgeApproval
    };
})();



module.exports = pubsubRepository;