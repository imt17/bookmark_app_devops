import pytest
from rest_framework import status
from conftest import api_client, create_user

url = '/api/v1/login/'

@pytest.mark.django_db
def test_login(api_client, create_user):
    username = 'testlogin'
    password = 'testpassword'

    create_user(username=username, password=password)
    response = api_client.post(url, {"username": username, "password": password})
    assert response.status_code == status.HTTP_200_OK
    assert "refresh" in response.data
    assert "access" in response.data
    assert response.data["username"] == username


@pytest.mark.django_db
def test_login_without_user_data(api_client):
    response = api_client.post(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.data['detail'] == "Invalid credentials"
