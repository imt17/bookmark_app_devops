from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Bookmark
from .serializers import BookmarkSerializer

class BookmarkListCreate(APIView):
    """
    View for listing all bookmarks and creating a new one.
    """

    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        # Get bookmarks for the authenticated user
        bookmarks = Bookmark.objects.filter(user=request.user)
        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Add the user to the bookmark data
        request.data['user'] = request.user.id  # Assuming you have a ForeignKey to User in your Bookmark model
        serializer = BookmarkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookmarkDetail(APIView):
    """
    View for retrieving, updating, and deleting an individual bookmark.
    """

    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request, pk):
        bookmark = get_object_or_404(Bookmark, pk=pk, user=request.user)  # Filter by user
        serializer = BookmarkSerializer(bookmark)
        return Response(serializer.data)

    def put(self, request, pk):
        bookmark = get_object_or_404(Bookmark, pk=pk, user=request.user)  # Filter by user
        serializer = BookmarkSerializer(bookmark, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        bookmark = get_object_or_404(Bookmark, pk=pk, user=request.user)  # Filter by user
        bookmark.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
