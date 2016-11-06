import json
import boto3
from events import local_settings
from events import settings
from boto.s3.key import Key
from boto.s3.connection import S3Connection

from profiles.forms import ProfileForm
from django.http import JsonResponse
from django.http.response import  HttpResponseForbidden

from django.views.generic.base import View
from registration.models import User
from profiles.models import UserProfile


class ProfileView(View):
    def get(self, request, profile_id):
        if request.user.is_authenticated:
            profile = UserProfile.get_by_id(profile_id)
            response = self.__get_dict(profile)
            return JsonResponse(response, safe=False)
        else:
            return HttpResponseForbidden('Permission denied')

    def post(self, request):
        if request.user.is_authenticated:
            info = json.loads(request.body.decode()) 
            try:
                profile = UserProfile()
                profile.user = User.get_user_by_id(info.get('user'))
                profile.photo = info.get('photo')
                profile.education = info.get('education')
                profile.job = info.get('job')
                form = ProfileForm(profile)
                if form.is_valid():
                    profile.save()
                    return JsonResponse({'status': 'success'}, status=200)
            except:
        	   return JsonResponse({'status': 'Please, check your personal information'}, status=400)
        else:
            return HttpResponseForbidden('Permission denied')

    def __get_dict(self, profile):
        user = User.get_user_by_id(profile.user)
        info = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'photo': FileManager.get_href(profile.photo),
            'education': profile.education,
            'job': profile.job
        }
        return json.dumps(info)


class FileManager(View):
    def get(self, request):
        response = {'path': ''}
        return JsonResponse(response, status=200)

    def post(self, request):
        path = json.loads(request.body.decode()) 
        if path:
            try:
                key_bucket = self.__get_key_bucket()
                key_bucket.key = path['path'].split('/')[-1]
                key_bucket.set_contents_from_filename(path['path'])
                return JsonResponse({'key_photo': key_bucket.key})
            except:
                return JsonResponse({'status': 'Please check your path : ' + path['path']}, status=400)
        else:
            return JsonResponse({'status': 'Please, input correct path'}, status=400)

    @classmethod
    def get_href(key, bucket_name=local_settings.NAME_PROFILES_BUCKET):
        conn = S3Connection(local_settings.ACCESS_KEY_ID, settings.SECRET_KEY)
        return conn.generate_url(300, "GET", bucket_name, key)

    def __connect_to_S3(self):
        return S3Connection(local_settings.ACCESS_KEY_ID, settings.SECRET_KEY) 

    def __get_key_bucket(self):
        bucket = self.__connect_to_S3().get_bucket(local_settings.NAME_PROFILES_BUCKET)
        return Key(bucket)
        
