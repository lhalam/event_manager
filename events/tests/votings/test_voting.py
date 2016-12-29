import pytest
import json

from django.test import Client
from event.models import Event, EventUserAssignment
from registration.models import User
from votings.models import Voting

start_date = 1483011011
end_date = start_date + 60 * 60
created_date = 1483019911

VOTING_TITLE = "test voting"
VOTING_DESCRIPTION = "test_description"


@pytest.fixture(scope='function')
def user_setup():
    user = User.objects.create_user(username='username', email='somemail@mail.com', password='password')
    yield user


@pytest.fixture(scope='function')
def client_setup(user_setup):
    user = Client()
    user.login(username='username', password='password')
    yield user


@pytest.fixture(scope='function')
def resource_setup(user_setup):
    event = Event.objects.create(
        pk=1,
        title="test_event",
        start_date=start_date,
        end_date=end_date,
        location="50, 50",
        place="some_place",
        description="test_description",
        created_date=created_date,
        owner=user_setup
    )
    Voting.objects.create(
        pk=1,
        title=VOTING_TITLE,
        description=VOTING_DESCRIPTION,
        end_date=end_date,
        type="custom",
        creation_date=created_date,
        event=event
    )
    Voting.objects.create(
        pk=2,
        title=VOTING_TITLE,
        description=VOTING_DESCRIPTION,
        end_date=end_date,
        type="date",
        creation_date=created_date,
        event=event
    )
    EventUserAssignment.objects.create(pk=1, user=user_setup, event=event)


@pytest.mark.django_db(transaction=False)
def test_permission_get(client, resource_setup):
    request = client.get('/api/v1/events/1/voting/')
    assert request.status_code == 403


@pytest.mark.django_db(transaction=False)
def test_event_not_exists(client_setup, resource_setup):
    request = client_setup.get('/api/v1/events/17/voting/')
    assert request.status_code == 404


@pytest.mark.django_db(transaction=False)
def test_auth_permission_get(client_setup, resource_setup):
    request = client_setup.get('/api/v1/events/1/voting/')
    response = json.loads(str(request.content.decode()))
    assert len(response['votings']) == 2
    assert response['owner']
    assert request.status_code == 200


@pytest.mark.django_db(transaction=False)
def test_auth_permission_get_item(client_setup, resource_setup):
    request = client_setup.get('/api/v1/events/1/voting/1/')
    response = json.loads(str(request.content.decode()))
    assert request.status_code == 200
    assert response['voting']['title'] == VOTING_TITLE


@pytest.mark.django_db(transaction=False)
def test_voting_not_exist(client_setup, resource_setup):
    request = client_setup.get('/api/v1/events/1/voting/3/')
    assert request.status_code == 404


@pytest.mark.django_db(transaction=False)
def test_deletion_of_not_existing_voting(client_setup, resource_setup):
    request = client_setup.delete('/api/v1/events/1/voting/3/')
    assert request.status_code == 404


@pytest.mark.django_db(transaction=False)
def test_deletion_of_voting_not_logged(client, resource_setup):
    request = client.delete('/api/v1/events/1/voting/2/')
    assert request.status_code == 403


@pytest.mark.django_db(transaction=False)
def test_deletion_of_voting_successful(client_setup, resource_setup):
    request = client_setup.delete('/api/v1/events/1/voting/1/')
    response = json.loads(str(request.content.decode()))
    assert request.status_code == 201
    assert len(response['votings']) == 1


