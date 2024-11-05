import pytest
from rest_framework import status
from conftest import refresh_token_data, api_client

url = '/api/v1/token/refresh/'

@pytest.mark.django_db
def test_refresh_token(refresh_token_data, api_client):
    response = api_client.post(url, refresh_token_data)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['access'] is not None

@pytest.mark.django_db
def test_refresh_token_without_refresh_token(api_client):
    response = api_client.post(url)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['detail'] == "Refresh token missing"
