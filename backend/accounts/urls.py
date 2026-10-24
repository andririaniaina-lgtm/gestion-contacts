from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'accounts'

# Router DRF : génère automatiquement les URLs pour les ViewSets
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'contacts',   views.ContactViewSet,  basename='contact')

urlpatterns = [
    # Authentification
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/',    views.login_view,    name='login'),
    path('auth/logout/',   views.logout_view,   name='logout'),
    path('auth/profile/',  views.profile_view,  name='profile'),

        # Import / Export CSV  (⚠️ à placer AVANT le router)
    path('contacts/export/', views.export_contacts_csv, name='contacts-export'),
    path('contacts/import/', views.import_contacts_csv, name='contacts-import'),

    # Routes générées par le router (categories, contacts)
    path('', include(router.urls)),
]