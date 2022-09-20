# This has the following dependencies in addition to enabling apis:
# 1. two image buckets - one private from which it is triggered, 
#                        one public read for approved thumbnails
# 2. a pubsub topic for the message if approved


from google.cloud import storage, vision
from google.cloud import pubsub_v1
from wand.image import Image
import os

client = storage.Client()
vision_client = vision.ImageAnnotatorClient()
destination_bucket =  os.environ.get("BUCKET", "kr-test-live")
project_id =  os.environ.get("PROJECT_ID", "kr-test-work")
topic_id =  os.environ.get("TOPIC_ID", "image_updated")

def make_thumbnail(data, context):
    # check if image is safe before doing work:
    current_name = data['name']
    bucket_name = data['bucket']
    blob_uri = f'gs://{bucket_name}/{current_name}'
    blob_source = {'source': {'image_uri': blob_uri}}

    print(f'Analyzing {current_name} in vision API.')
    result = vision_client.safe_search_detection(blob_source)
    detected = result.safe_search_annotation
    if detected.adult == 5 or detected.violence == 5:
        print(f'The image {current_name} was detected as inappropriate.')
    else:
        print(f'The image {current_name} was detected as appropriate, proceeding to resize.')        
        # renamed for live bucket
        new_name = f"thumbnail-{data['name']}"
        # Get the bucket which the image has been uploaded to
        bucket = client.get_bucket(data['bucket'])
        final_bucket = client.get_bucket(destination_bucket)
        # get the image
        thumbnail = Image(blob=bucket.get_blob(data['name']).download_as_string())
        # only resize if it's bigger than our maximum size
        size = 280
        if size < thumbnail.width:
            print(('resizing image ' + current_name))
            newHeight = int((size * thumbnail.height) / thumbnail.width)
            thumbnail.resize(size, newHeight)
        # save the image to the final bucket
        thumbnail_blob = final_bucket.blob(new_name)
        thumbnail_blob.upload_from_string(thumbnail.make_blob())
        # publish message to topic
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(project_id, topic_id)
        future = publisher.publish(topic_path, b'new image to approve!', image=current_name)
        print(future.result())