from registration.models import User
from event.models import Event

from django.test import Client
import pytest
import json


fields_require = json.dumps({})
title_max = json.dumps({"title": "a" * 257})
start_and_end_date_early_than_now = json.dumps({"start_date": 1, "end_date": 2})
end_date_earlier_than_start = json.dumps({"start_date": 1735689600, "end_date": 1735680600})
wrong_date_format = json.dumps({"start_date": "date", "end_date" : "date"})
wrong_location = json.dumps({'location': 'location'})
descrioption_max = json.dumps({"description": "a" * 401})


"""
def test_create_event(admin_client):
    Event.objects.create({
        'title': 'New Event',
        'start_date': 1767005384,
        'end_date': 1777005384,
        'location': '49,49',
        'place': 'Some Place',
        'description': 'Description'
        'owner': 
    })
"""

def test_permission_get(client):
    client = Client()
    request = client.get('/api/v1/events/')
    assert request.status_code == 403

def test_permission_post():
    request = client.post('/api/v1/events/')
    assert request.status_code == 403

def test_all_fields_required(admin_client):
    request = admin_client.post('/api/v1/events/', fields_require, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    for k, v in response.items(): assert v[0]['code'] == 'required'
    assert request.status_code == 400

def test_title_more_than_256(admin_client):
    request = admin_client.post('/api/v1/events/', title_max, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert response['title'][0]['code'] == 'max_length'
    assert request.status_code == 400

def test_start_and_end_date_early_than_now(admin_client):
    request = admin_client.post('/api/v1/events/', start_and_end_date_early_than_now, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert response['start_date'][0]['code'] == 'early'
    assert response['end_date'][0]['code'] == 'early'
    assert request.status_code == 400

def test_end_date_earlier_than_start(admin_client):
    request = admin_client.post('/api/v1/events/', end_date_earlier_than_start, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert response["end_date"][0]["code"] == "early"
    assert request.status_code == 400

def test_wrong_date_format(admin_client):
    request = admin_client.post('/api/v1/events/', wrong_date_format, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert response['start_date'][0]['code'] == 'item_invalid'
    assert response['end_date'][0]['code'] == 'item_invalid'
    assert request.status_code == 400

def test_wrong_location(admin_client):
    request = admin_client.post('/api/v1/events/', wrong_location, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert response['location'][0]['code'] == "item_invalid"
    assert request.status_code == 400

def test_descrioption_more_than_400(admin_client):
    request = admin_client.post('/api/v1/events/', descrioption_max, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert response["description"][0]["code"] == "max_length"
    assert request.status_code == 400

def test_unauthorized_user(client):
    request = client.post('/api/v1/events/', {}, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert request.status_code == 403

def test_get_all_events(admin_client):
    request = admin_client.get('/api/v1/events/', {})
    response = json.loads(str(request.content.decode()))
    assert response == []
    assert request.status_code == 200

"""
def test_get_null_event(admin_client):
    request = admin_client.get('/api/v1/events/1', {})
    response = json.loads(str(request.content.decode()))
    assert response == []
    assert request.status_code == 200
"""