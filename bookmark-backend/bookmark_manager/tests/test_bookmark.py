import pytest
from rest_framework import status
from conftest import access_token, api_client

url = '/bookmarks/'

@pytest.mark.django_db
def test_view_bookmark(api_client, access_token):
    response = api_client.get(url, HTTP_AUTHORIZATION=f'Bearer {access_token}')
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_view_bookmark_without_authorization(api_client):
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_create_bookmark(api_client, access_token):
    data={
	"title": "bookmark for test user",
	"category": "Work",
    "url": "http://localhost:3333/blalalalala/"
}
    response = api_client.post(url, data, HTTP_AUTHORIZATION=f'Bearer {access_token}', format='json')
    assert response.status_code == status.HTTP_201_CREATED

