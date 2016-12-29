from registration.models import User
from event.models import Event

from django.test import Client
import pytest
import json


fields_require = json.dumps({})
title_max = json.dumps({"title": "a" * 257})
start_and_end_date_early_than_now = json.dumps({"start_date": 1, "end_date": 2})
end_date_earlier_than_start = json.dumps({"start_date": 1735689600, "end_date": 1735980600})
wrong_date_format = json.dumps({"start_date": "date", "end_date" : "date"})
wrong_location = json.dumps({'location': 'location'})
descrioption_max = json.dumps({"description": "a" * 401})




@pytest.fixture(scope="function")
def resource_setup(django_db_blocker, django_db_setup, db):
    user = User.objects.create(username='testuser', password='12345')
    re = Client()
    username = 'agconti'
    email = 'test@test.com'
    password = 'test'        
    test_user = User.objects.create_user(username, email, password)
    re.login(username=username, password=password)
    event = Event.objects.create(title="New Event", start_date= 1514563922, end_date= 1524563922, location= "50, 50", place= "Some Place", description= "Description", owner= user)
    #import pdb; pdb.set_trace()
    return re

def test_get_event(resource_setup):
    request = resource_setup.get('/api/v1/events/1/')
    assert request.status_code == 200

def test_get_events(resource_setup):
    request = resource_setup.get('/api/v1/events/')
    assert request.status_code == 200

def test_permission_get(client):
    client = Client()
    request = client.get('/api/v1/events/')
    assert request.status_code == 403

def test_permission_post(client):
    request = client.post('/api/v1/events/')
    assert request.status_code == 403

def test_all_fields_required(resource_setup):
    request = resource_setup.post('/api/v1/events/', fields_require, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    for k, v in response.items(): assert v[0]['code'] == 'required'
    assert request.status_code == 400

def test_title_more_than_256(resource_setup):
    request = resource_setup.post('/api/v1/events/', title_max, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert response['title'][0]['code'] == 'max_length'
    assert request.status_code == 400

def test_start_and_end_date_early_than_now(resource_setup):
    request = resource_setup.post('/api/v1/events/', start_and_end_date_early_than_now, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert response['start_date'][0]['code'] == 'early'
    assert response['end_date'][0]['code'] == 'early'
    assert request.status_code == 400

def test_end_date_earlier_than_start(resource_setup):
    request = resource_setup.post('/api/v1/events/', end_date_earlier_than_start, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert response["end_date"][0]["code"] == "early"
    assert request.status_code == 400

def test_wrong_date_format(resource_setup):
    request = resource_setup.post('/api/v1/events/', wrong_date_format, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert response['start_date'][0]['code'] == 'item_invalid'
    assert response['end_date'][0]['code'] == 'item_invalid'
    assert request.status_code == 400

def test_wrong_location(resource_setup):
    request = resource_setup.post('/api/v1/events/', wrong_location, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert response['location'][0]['code'] == "item_invalid"
    assert request.status_code == 400

def test_descrioption_more_than_400(resource_setup):
    request = resource_setup.post('/api/v1/events/', descrioption_max, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert response["description"][0]["code"] == "max_length"
    assert request.status_code == 400

def test_unauthorized_user(client):
    request = client.post('/api/v1/events/', {}, content_type="application/json")
    response = json.loads(str(request.content.decode()))
    assert request.status_code == 403

def test_get_all_events(resource_setup):
    request = resource_setup.get('/api/v1/events/', {})
    response = json.loads(str(request.content.decode()))
    assert response == []
    assert request.status_code == 200
