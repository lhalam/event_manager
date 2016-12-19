import json
import socket
from events import local_settings
from boto.s3.key import Key
from boto.s3.connection import S3Connection

from profiles.forms import ProfileForm
from django.http import JsonResponse
from django.http.response import HttpResponseForbidden

from django.views.generic.base import View
from registration.models import User
from profiles.models import UserProfile


class ProfileView(View):
    def get(self, request, profile_id):
        if request.user.is_authenticated:
            print(profile_id)
            profile = UserProfile.get_by_id(profile_id)
            return JsonResponse(ProfileView.to_dict(profile), status=200)
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
                else:
                    return JsonResponse({'status': 'Some fields are incorrect. Please check.'}, status=400)
            except:
                return JsonResponse({'status': 'Please, check your personal information'}, status=400)
        else:
            return HttpResponseForbidden('Permission denied')

    @staticmethod
    def to_dict(profile):
        user = User.get_by_id(profile.user)
        return {
            'user': user.to_dict(),
            'photo': FileManager.get_href(profile.photo),
            'education': profile.education,
            'job': profile.job
        }


class FileManager(View):

    CONN = S3Connection(local_settings.ACCESS_KEY_ID, local_settings.AWS_SECRET_ACCESS_KEY)

    def post(self, request):
        path = json.loads(request.body.decode())
        if not path:
            return JsonResponse({'status': 'Please, input correct path'}, status=400)
        try:
            key_bucket = self.__get_key_bucket()
            key_bucket.key = path['path'].split('/')[-1]
            key_bucket.set_contents_from_filename(filename=path['path'])
            return JsonResponse({'key_photo': key_bucket.key})
        except socket.error:
            return JsonResponse({'status': 'Please check your path : ' + path['path']}, status=400)

    @staticmethod
    def get_href(key, bucket_name=local_settings.NAME_PROFILES_BUCKET):
        return FileManager.CONN.generate_url(expires_in=0,
                                             method="GET",
                                             bucket=bucket_name,
                                             key=key,
                                             query_auth=False
                                             )

    def __get_key_bucket(self):
        bucket = self.CONN.get_bucket(local_settings.NAME_PROFILES_BUCKET)
        return Key(bucket)
