from django.views.generic.base import View

from boto.s3.key import Key
from boto.s3.connection import S3Connection

from events import local_settings


class FileManager(View):
    CONN = S3Connection(local_settings.ACCESS_KEY_ID, local_settings.AWS_SECRET_ACCESS_KEY)

    @staticmethod
    def delete_by_key(key):
        bucket = FileManager.CONN.get_bucket(local_settings.NAME_PROFILES_BUCKET)
        k = FileManager.get_key_bucket()
        k.key = key
        bucket.delete_key(k)
        return True

    @staticmethod
    def get_href(key, bucket_name=local_settings.NAME_PROFILES_BUCKET):
        return FileManager.CONN.generate_url(expires_in=0,
                                             method="GET",
                                             bucket=bucket_name,
                                             key=key,
                                             query_auth=False,
                                             force_http=True
                                             )

    @staticmethod
    def get_key_bucket():
        bucket = FileManager.CONN.get_bucket(local_settings.NAME_PROFILES_BUCKET)
        return Key(bucket)
