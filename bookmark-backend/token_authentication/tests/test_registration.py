import pytest
from rest_framework import status

url = '/api/v1/register/'

@pytest.mark.django_db
def test_registration_right_user(api_client, right_user):
    response = api_client.post(url, right_user)
    assert response.status_code == status.HTTP_201_CREATED
    assert 'refresh' in response.data
    assert 'access' in response.data

@pytest.mark.django_db
def test_registration_wrong_user(api_client, wrong_user):
    response = api_client.post(url, wrong_user)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['email'] == ["This field is required."]
    assert response.data['password'] == ["This field is required."]

@pytest.mark.django_db
def test_registration_duplicate_user(api_client, right_user):
    response = api_client.post(url, right_user)
    assert response.status_code == status.HTTP_201_CREATED

    response = api_client.post(url, right_user)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['username'] == ["A user with that username already exists."]
    assert response.data['email'] == ["This field must be unique."]
