import json
import socket

from profiles.forms import ProfileForm
from django.http import JsonResponse
from django.http.response import HttpResponseForbidden, HttpResponseNotFound
from django.utils.datastructures import MultiValueDictKeyError
from django.views.generic.base import View

from registration.models import User
from profiles.models import UserProfile
from events.views import INVALID_PAYLOAD, SERVER_ERROR, PERMISSION_DENIED
from utils.FileService import FileManager

DEFAULT_PHOTO = 'default_photo.jpg'


class ProfileView(View):
    def get(self, request, profile_id=None):
        owner = True
        if profile_id:
            profile = UserProfile.get_by_id(profile_id)
            if int(profile_id) != int(request.user.id):
                owner = False
        else:
            profile = UserProfile.get_by_id(request.user.id)
        if not profile:
            return HttpResponseNotFound('User not found')
        return JsonResponse({'profile': ProfileView.to_dict(profile), 'owner': owner}, status=200)

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
            'job': profile.job,
            'key': profile.photo
        }


class ProfilePicture(View):
    def post(self, request):
        try:
            file = request.FILES['profile_pic']
        except MultiValueDictKeyError:
            return INVALID_PAYLOAD
        try:
            key_bucket = FileManager.get_key_bucket()
            key_bucket.key = file.name
            key_bucket.set_contents_from_file(file)
            key_bucket.set_acl('public-read')
        except socket.error:
            return SERVER_ERROR
        else:
            profile = UserProfile.get_by_id(request.user.id)
            profile.photo = key_bucket.key
            profile.save()
            photo = FileManager.get_href(key_bucket.key)
            return JsonResponse({'photo': photo})

    def delete(self, request, profile_id):
        profile = UserProfile.get_by_id(profile_id)
        if not profile or str(request.user.id) != profile_id:
            return PERMISSION_DENIED
        key = profile.photo
        profile.photo = DEFAULT_PHOTO
        profile.save()
        FileManager.delete_by_key(key)
        return JsonResponse({'photo': FileManager.get_href(DEFAULT_PHOTO), "key": DEFAULT_PHOTO}, status=200)
