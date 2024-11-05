from django.urls import path
from .views import BookmarkListCreate, BookmarkDetail

urlpatterns = [
    path('bookmarks/', BookmarkListCreate.as_view(), name='bookmark-list-create'),
    path('bookmarks/<int:pk>/', BookmarkDetail.as_view(), name='bookmark-detail'),
]
