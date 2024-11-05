import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

@pytest.fixture(scope="function")
def user() -> User:
    yield User.objects.create_user(
        username='adminuser',
        password='1234',
        email='adminuser@gmail.com',
    )

@pytest.fixture(scope='function')
def api_client():
    return APIClient()

@pytest.fixture(scope='function')
def right_user():
    return {
        'username': 'username',
        'email': 'user@test.com',
        'password': 'password',
        'first_name': 'test',
        'last_name': 'user'
    }

@pytest.fixture(scope='function')
def wrong_user():
    # Missing required fields like 'password' to simulate incorrect data
    return {
        'username': 'username123'
    }

@pytest.fixture
def create_user():
    def make_user(username, password):
        user = User.objects.create_user(username=username, password=password)
        return user
    return make_user

@pytest.fixture(scope='function')
def refresh_token_data(user):
    refresh = RefreshToken.for_user(user)
    data = {'refresh': refresh}
    return data

@pytest.fixture(scope='function')
def access_token_data(user):
    refresh_token = RefreshToken.for_user(user)
    access_token = refresh_token.access_token
    # print('refresh_token ----------->>>>>>>>>>>', refresh_token)
    # print('access_token ----------->>>>>>>>>>>', access_token)
    return {'access': access_token}

