import json
from .models import User
from boto.s3.key import Key
from events import settings
from .models import UserProfile
from django.shortcuts import render
from boto.s3.key import Key
from boto.s3.connection import S3Connection
from django.http import JsonResponse
from django.views.generic.base import View

class ProfileView(View):
    def post(self, request):
        try:
            profile = [model_to_dict(data) for data in User.get_user_by_id(user_id)]
            return JsonResponse(json.dumps(profile), status=200)
        except:
        	return JsonResponse({"not_existing_users": 'true'}, status=404)

class FileManager(View):
    def get(self, request):
        key_bucket = self.get_key_bucket()
        key_bucket.key = self.get_path().split('/')[-1]
        key_bucket.get_contents_to_filename(self.get_path)
        return JsonResponse({'key_photo': key_bucket.key})

    def post(self, request):
        key_bucket = self.get_key_bucket()
    	key_bucket.key = self.get_path().split('/')[-1]
        key_bucket.set_contents_from_filename(self.get_path)
        return JsonResponse({'key_photo': k.key})

    def delete(self, request):
        key_bucket = self.get_key_bucket()
        key_bucket.key = self.get_path().split('/')[-1]
        try:
            key_bucket.key.delete()
            return JsonResponse({'photo_deleted': 'success'})
        except:
            return JsonResponse({'photo_deleted': 'error'})

    def connect_to_S3(self):
        conn = S3Connection(settings.ACCESS_KEY_ID, settings.SECRET_KEY) 
        conn = S3Connection()
        return conn

    def get_path(self):
        return '/home/roksa/Downloads/default_photo.png'

    def get_key_bucket(self):
        name_profiles_bucket = settings.NAME_PROFILES_BUCKET
        bucket = self.connect_to_S3().get_bucket(name_profiles_bucket)
        key_bucket = Key(bucket)
        return key_bucket
