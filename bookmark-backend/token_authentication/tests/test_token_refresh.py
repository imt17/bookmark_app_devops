from datetime import timedelta

import pytest
from rest_framework import status
from conftest import refresh_token, api_client

url = '/api/v1/token/refresh/'

@pytest.mark.django_db
def test_refresh_token(api_client, refresh_token):
    refresh_token_data = {"refresh": refresh_token}
    response = api_client.post(url, refresh_token_data)

    assert response.status_code == status.HTTP_200_OK
    assert response.data['access'] is not None

@pytest.mark.django_db
def test_expired_refresh_token(api_client, refresh_token):
    expired_refresh = refresh_token.set_exp(lifetime=timedelta(seconds=-3600))
    response = api_client.post(url, expired_refresh)
    assert response.status_code == status.HTTP_400_BAD_REQUEST



