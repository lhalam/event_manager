from django.http import HttpResponse, JsonResponse

PERMISSION_DENIED = JsonResponse({"error_message": "Permission denied"}, status=403)
INVALID_PAYLOAD = JsonResponse({"error_message": "Invalid payload"}, status=400)
NO_CONTENT = HttpResponse(status=204)
CREATED = JsonResponse({'success': True}, status=201)
