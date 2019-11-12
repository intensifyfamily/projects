from django.urls import path,include
from . import views
app_name = 'hospital'

urlpatterns = [
    path('api/v1/log/', views.AuthView.as_view()),
    path('api/v1/signup/', views.SignupView.as_view()),
    path('api/v1/doctor/', views.DoctorView.as_view()),
    path('api/v1/patient/', views.PatientView.as_view()),
    path('api/v1/register/', views.RegisterView.as_view()),
    path('api/v1/edit/', views.EditView.as_view()),
    path('api/v1/delete/', views.DeleteView.as_view()),
]
