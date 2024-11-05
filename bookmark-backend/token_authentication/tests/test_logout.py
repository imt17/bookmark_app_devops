import pytest
from rest_framework import status

url = '/api/v1/logout/'

@pytest.mark.django_db
def test_logout(api_client, access_token_data, refresh_token_data):
    access = access_token_data['access']
    response = api_client.post(url, refresh_token_data, HTTP_AUTHORIZATION=f"Bearer {access}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert response.data is None

@pytest.mark.django_db
def test_logout_without_bearer(api_client, refresh_token_data):
    response = api_client.post(url, refresh_token_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.data['detail'] == 'Authentication credentials were not provided.'

@pytest.mark.django_db
def test_logout_without_refresh_token(api_client, access_token_data):
    access = access_token_data['access']
    response = api_client.post(url, HTTP_AUTHORIZATION=f"Bearer {access}")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['detail'] == "'refresh'"
