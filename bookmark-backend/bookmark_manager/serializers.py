from rest_framework import serializers
from bookmark_manager.models import Bookmark

class BookmarkSerializer(serializers.ModelSerializer):

    class Meta:
        model = Bookmark
        fields = "__all__"
