from django.urls import path
from . import views

app_name = "ddu_app"

urlpatterns = [
    path("api/v1/signup/", views.SignUpView.as_view()),
    path("api/v1/login/", views.LogInView.as_view()),
    path("api/v1/get_user/", views.GetUserView.as_view()),
    path("api/v1/get_stu_info/", views.GetInfo.as_view()),
]
