import pytest
from rest_framework import status
from conftest import refresh_token, access_token

url = '/api/v1/logout/'
refresh_token_data = {"refresh": str(refresh_token)}

@pytest.mark.django_db
def test_logout(api_client, access_token, refresh_token):
    refresh_token_data = {"refresh": str(refresh_token)}
    response = api_client.post(url, refresh_token_data, HTTP_AUTHORIZATION=f"Bearer {access_token}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert response.data is None


