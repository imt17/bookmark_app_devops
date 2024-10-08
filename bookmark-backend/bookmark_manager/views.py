from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Bookmark
from .serializers import BookmarkSerializer


class BookmarkListCreate(APIView):
    """
    View for listing all bookmarks and creating a new one.
    """

    def get(self, request):
        bookmarks = Bookmark.objects.all()
        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BookmarkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookmarkDetail(APIView):
    """
    View for retrieving, updating, and deleting an individual bookmark.
    """

    def get(self, request, pk):
        bookmark = get_object_or_404(Bookmark, pk=pk)
        serializer = BookmarkSerializer(bookmark)
        return Response(serializer.data)

    def put(self, request, pk):
        bookmark = get_object_or_404(Bookmark, pk=pk)
        serializer = BookmarkSerializer(bookmark, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        bookmark = get_object_or_404(Bookmark, pk=pk)
        bookmark.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
