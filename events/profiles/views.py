import json
from registration.models import User
from boto.s3.key import Key
from events import settings
from .models import UserProfile
from django.shortcuts import render
from boto.s3.key import Key
from boto.s3.connection import S3Connection
from django.http import JsonResponse
from django.views.generic.base import View
from .forms import ProfileForm
from profiles.models import UserProfile
import json
from django.core import serializers
from django.forms.models import model_to_dict

class ProfileView(View):
    def get(self, request, pk=1):
        if UserProfile.get_by_id(pk) == None:
            return JsonResponse({'exception':'no this profile'})
        else:
            profile = model_to_dict(UserProfile.get_by_id(pk))
            return JsonResponse(json.dumps(profile))

    def put(self, request, profile_id):
        data = json.loads(request.body.decode()) 
        if not User.get_user_by_id(data.get('user')):
            UserProfile.create_user_profile(data)
        else:
            try:
                profile = UserProfile.get_by_id(pk=profile_id)
            except:
                return JsonResponseNotFound({"error": "Does not exist"})
            else:
                response = profile.model_to_dict()
                return JsonResponse(json.dumps(response), status=200)

    def post(self, request):
        data = json.loads(request.body.decode()) 
        try:
            profile = UserProfile()
            profile.user = User.get_user_by_id(data.get('user'))
            profile.photo = data.get('photo')
            profile.education = data.get('education')
            profile.job = data.get('job')
            profile.save()
            return JsonResponse({'message': 'added'}, status=200)
        except:
        	return JsonResponse({"error": 'Have problem with adding'}, status=404)

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
