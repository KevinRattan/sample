const { Storage } = require('@google-cloud/storage');
const BUCKET = process.env.BUCKET ? process.env.BUCKET : "";

const imageRepository = (function() {

    const saveImage = function(image, name) {
        return new Promise((resolve, reject) => {
            const storage = new Storage();
            const myBucket = storage.bucket(BUCKET);
            const file = myBucket.file(name);

            const stream = file.createWriteStream({
                metadata: {
                    contentType: 'image/jpeg'
                },
                validation: 'md5'
            });
            stream.on('error', (err) => {
                reject(err);
            });
            stream.on('finish', () => {
                console.log('saved image: ' + name);
                resolve(true);

            });
            stream.end(Buffer.from(image.buffer));
          });
    };


    return {
        saveImage
    };
})();

module.exports = imageRepository;