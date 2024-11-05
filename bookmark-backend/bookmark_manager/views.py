from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Bookmark
from .serializers import BookmarkSerializer
from token_authentication.models import CustomUser
import jwt
from django.conf import settings
from token_authentication.views import TokenRefreshView
from rest_framework.test import APIRequestFactory
from django.contrib.auth import get_user_model
from datetime import datetime


def is_access_token_expired(token):
    try:
        # Decode the token without verifying the signature to get the payload
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"], options={"verify_signature": False})
        # Get the expiration time from the token
        exp_timestamp = payload.get("exp")
        if not exp_timestamp:
            return True  # If no expiration time, treat as expired

        # Convert the expiration timestamp to a datetime object
        exp_datetime = datetime.fromtimestamp(exp_timestamp)
        # Check if the expiration time is in the past
        return exp_datetime < datetime.now()
    except jwt.DecodeError:
        # If the token is invalid and cannot be decoded, treat as expired
        return True

def get_new_access_token(token):
    refresh_view = TokenRefreshView.as_view()
    factory = APIRequestFactory()
    request = factory.post("/api/v1/token/refresh/", {"refresh": token})
    response = refresh_view(request)

    if response.status_code == 200:
        # Token was successfully refreshed, get the new access token
        new_access_token = response.data.get("access")
        if new_access_token:
            # Return the new token
            return new_access_token
    # If the refresh failed, return None
    return None

def decode_jwt_token(token):
    if not token or not token.startswith("Bearer "):
        return None, JsonResponse({"error": "Token missing or invalid"}, status=401)

    token = token.split(" ")[1]  # Extract the actual token

    # Check if the token is expired
    if is_access_token_expired(token):
        # Try to refresh the token
        token = get_new_access_token(token)
        if not token:
            return None, JsonResponse({"error": "Token is expired and could not be refreshed"}, status=401)

    try:
        # Decode the JWT token to get the user_id
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            return None, JsonResponse({"error": "Invalid token"}, status=401)
        return user_id, None
    except jwt.InvalidTokenError:
        return None, JsonResponse({"error": "Token is invalid"}, status=401)

def get_user_by_token(request):
    token = request.headers.get("Authorization")
    user_id, error_response = decode_jwt_token(token)
    if error_response:
        return None, error_response

    # Get the user object
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        return user, None
    except User.DoesNotExist:
        return None, JsonResponse({"error": "User not found"}, status=404)

class BookmarkListCreate(APIView):
    """
    View for listing all bookmarks and creating a new one.
    """
    def get(self, request):
        user, error_response = get_user_by_token(request)
        if error_response:
            return error_response

        bookmarks = Bookmark.objects.filter(user=user)
        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response(serializer.data)

    def post(self, request):
        user, error_response = get_user_by_token(request)
        if error_response:
            return error_response

        # Create a new bookmark, associating it with the authenticated user
        bookmark_data = request.data
        bookmark_data['user'] = user.id  # Set the user field in the data

        serializer = BookmarkSerializer(data=bookmark_data)
        if serializer.is_valid():
            serializer.save(user=user)  # Save with the user instance
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookmarkDetail(APIView):
    """
    View for retrieving, updating, and deleting an individual bookmark.
    """
    def get(self, request, pk):
        user, error_response = get_user_by_token(request)
        if error_response:
            return error_response

        bookmark = get_object_or_404(Bookmark, pk=pk, user=user)
        serializer = BookmarkSerializer(bookmark)
        return Response(serializer.data)

    def put(self, request, pk):
        user, error_response = get_user_by_token(request)
        if error_response:
            return error_response

        bookmark = get_object_or_404(Bookmark, pk=pk, user=user)
        serializer = BookmarkSerializer(bookmark, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user, error_response = get_user_by_token(request)
        if error_response:
            return error_response

        bookmark = get_object_or_404(Bookmark, pk=pk, user=user)
        bookmark.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
