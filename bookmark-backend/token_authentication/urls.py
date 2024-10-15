from django.urls import path
from .views import RegisterView, LogoutView, LoginView, TokenRefreshView


urlpatterns = [
    path('api/v1/register/', RegisterView.as_view(), name='register'),
    path('api/v1/login/', LoginView.as_view(), name='login'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/logout/', LogoutView.as_view(), name='logout'),
]
