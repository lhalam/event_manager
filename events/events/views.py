from django.http import HttpResponse, JsonResponse

PERMISSION_DENIED = JsonResponse({"error_message": "Permission denied"}, status=403)
INVALID_PAYLOAD = JsonResponse({"error_message": "Invalid payload"}, status=400)
SERVER_ERROR = JsonResponse({'error_message': 'Server error. Please, try later'}, status=500)
NO_CONTENT = HttpResponse(status=204)
CREATED = JsonResponse({'success': True}, status=201)
