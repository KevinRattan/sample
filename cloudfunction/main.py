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

    # only do any work if the image is safe:
    safe = __check_image(data)

    # name of the image in temp bucket 
    currentName = data['name']
    # renamed for live bucket
    newName = f"thumbnail-{data['name']}"
    size = 280

    # Get the bucket which the image has been uploaded to
    bucket = client.get_bucket(data['bucket'])
    final_bucket = client.get_bucket(destination_bucket)
    # get the image
    thumbnail = Image(blob=bucket.get_blob(data['name']).download_as_string())

    if safe:
        # only resize if it's bigger than our maximum size
        if size < thumbnail.width:
            print(('resizing image ' + currentName))
            newHeight = int((size * thumbnail.height) / thumbnail.width)
            thumbnail.resize(size, newHeight)
        # save the image to the final bucket
        thumbnail_blob = final_bucket.blob(newName)
        thumbnail_blob.upload_from_string(thumbnail.make_blob())
        # publish message to topic
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(project_id, topic_id)
        future = publisher.publish(topic_path, b'new image to approve!', image=currentName)
        print(future.result())
    else:
        print('Not replacing image as was inappropriate')

def __check_image(file_data):
    file_name = file_data['name']
    bucket_name = file_data['bucket']
    blob_uri = f'gs://{bucket_name}/{file_name}'
    blob_source = {'source': {'image_uri': blob_uri}}

    print(f'Analyzing {file_name} in vision API.')

    result = vision_client.safe_search_detection(blob_source)
    detected = result.safe_search_annotation

    if detected.adult == 5 or detected.violence == 5:
        print(f'The image {file_name} was detected as inappropriate.')
        return False
    else:
        print(f'The image {file_name} was detected as OK.')
        return True