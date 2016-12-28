import json
import socket

from profiles.forms import ProfileForm
from django.http import JsonResponse
from django.http.response import HttpResponseNotFound
from django.utils.datastructures import MultiValueDictKeyError
from django.views.generic.base import View

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
        return JsonResponse({'profile': profile.to_dict(), 'owner': owner}, status=200)

    def put(self, request, profile_id):
        if not request.user.is_authenticated or str(request.user.id) != profile_id:
            return PERMISSION_DENIED
        profile_data = json.loads(request.body.decode())
        profile_form = ProfileForm(profile_data)
        if not profile_form.is_valid():
            return JsonResponse({'success': False, 'errors': profile_form.errors}, status=400)
        UserProfile.objects.filter(pk=profile_id).update(**profile_form.cleaned_data)
        return JsonResponse({
                             'success': True,
                             'profile': UserProfile.get_by_id(request.user.id).to_dict()
                             }, status=200)


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
            UserProfile.objects.filter(pk=request.user.id).update(photo=key_bucket.key)
            photo = FileManager.get_href(key_bucket.key)
            return JsonResponse({'photo': photo})

    def delete(self, request, profile_id):
        profile = UserProfile.get_by_id(profile_id)
        if not profile or str(request.user.id) != profile_id:
            return PERMISSION_DENIED
        key = profile.photo
        UserProfile.objects.filter(pk=profile_id).update(photo=DEFAULT_PHOTO)
        FileManager.delete_by_key(key)
        return JsonResponse({'photo': FileManager.get_href(DEFAULT_PHOTO), "key": DEFAULT_PHOTO}, status=200)
