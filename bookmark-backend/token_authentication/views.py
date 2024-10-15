from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.contrib.auth import authenticate

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        # Authenticate user
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # If the user is authenticated, issue JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            return Response({
                'refresh': str(refresh),
                'access': str(access_token),
                'username': username,
            }, status=status.HTTP_200_OK)
        else:
            # If authentication fails, return an error
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh")

        # Check if the refresh token is provided
        if not refresh_token:
            return Response({"detail": "Refresh token missing"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Validate the provided refresh token
            refresh = RefreshToken(refresh_token)
            access_token = refresh.access_token

            return Response({
                'access': str(access_token)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Catch invalid token errors
            return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        # Assuming you have a serializer for registration
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # Create the user
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)