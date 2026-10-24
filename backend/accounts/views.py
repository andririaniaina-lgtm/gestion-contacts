import csv
import io
from django.http import HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .serializers import RegisterSerializer, UserSerializer
from rest_framework import viewsets
from .serializers import RegisterSerializer, UserSerializer, CategorySerializer, ContactSerializer
from .models import Category, Contact
from rest_framework.authtoken.models import Token 


# ============================================================
# INSCRIPTION
# ============================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Crée un nouveau compte utilisateur.
    POST /api/auth/register/
    Body : { username, email, first_name, last_name, password, password2 }
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {
                "message": "Compte créé avec succès.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# CONNEXION
# ============================================================


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Connecte un utilisateur et renvoie un token d'authentification.
    POST /api/auth/login/
    Body : { username, password }
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"error": "Nom d'utilisateur et mot de passe requis."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response(
            {"error": "Identifiants invalides."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Récupère ou crée le token de l'utilisateur
    token, created = Token.objects.get_or_create(user=user)

    return Response(
        {
            "message": "Connexion réussie.",
            "token": token.key,
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_200_OK,
    )

# ============================================================
# DÉCONNEXION
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Déconnecte l'utilisateur en supprimant son token.
    POST /api/auth/logout/
    """
    # Supprime le token de l'utilisateur
    Token.objects.filter(user=request.user).delete()
    return Response(
        {"message": "Déconnexion réussie."},
        status=status.HTTP_200_OK,
    )
# ============================================================
# PROFIL (utilisateur connecté)
# ============================================================

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Récupère ou modifie le profil de l'utilisateur connecté.
    GET   /api/auth/profile/   → récupérer
    PATCH /api/auth/profile/   → modifier (partiel)
    """
    user = request.user

    if request.method == 'GET':
        return Response(UserSerializer(user).data)

    # PUT ou PATCH
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                "message": "Profil mis à jour.",
                "user": serializer.data,
            }
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ============================================================
# CATEGORIES
# ============================================================



class CategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour les catégories de l'utilisateur connecté.
    GET    /api/categories/           → liste
    POST   /api/categories/           → créer
    GET    /api/categories/{id}/      → détail
    PUT    /api/categories/{id}/      → modifier (complet)
    PATCH  /api/categories/{id}/      → modifier (partiel)
    DELETE /api/categories/{id}/      → supprimer
    """
    serializer_class = CategorySerializer

    def get_queryset(self):
        # Chaque user ne voit QUE ses propres catégories
        return Category.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Assigne automatiquement l'utilisateur connecté comme propriétaire
        serializer.save(owner=self.request.user)

# ============================================================
# CONTACTS
# ============================================================

from django.utils import timezone
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination


class ContactPagination(PageNumberPagination):
    """Pagination de 10 contacts par page (configurable)."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ContactViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour les contacts de l'utilisateur connecté.
    Inclut : recherche, filtres, tri, favoris, corbeille.
    """
    serializer_class = ContactSerializer
    pagination_class = ContactPagination

    def get_queryset(self):
        """
        Retourne les contacts du user connecté avec :
        - par défaut : contacts NON supprimés
        - possibilité de filtrer par catégorie, favoris, corbeille
        - recherche par nom, email, entreprise, ville
        - tri par différents champs
        """
        user = self.request.user
        qs = Contact.objects.filter(owner=user).select_related('category')

        # --- Filtre : corbeille ---
        trash = self.request.query_params.get('trash', 'false').lower()
        if trash == 'true':
            qs = qs.filter(is_deleted=True)
        else:
            qs = qs.filter(is_deleted=False)

        # --- Filtre : favoris ---
        favorite = self.request.query_params.get('favorite', 'false').lower()
        if favorite == 'true':
            qs = qs.filter(is_favorite=True)

        # --- Filtre : catégorie ---
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)

        # --- Recherche ---
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(company__icontains=search) |
                Q(city__icontains=search) |
                Q(phone__icontains=search)
            )

        # --- Tri ---
        ordering = self.request.query_params.get('ordering', '-created_at')
        allowed_ordering = [
            'first_name', '-first_name',
            'last_name', '-last_name',
            'created_at', '-created_at',
            'updated_at', '-updated_at',
            'city', '-city',
        ]
        if ordering in allowed_ordering:
            qs = qs.order_by(ordering)

        return qs

    def perform_create(self, serializer):
        """Assigne automatiquement le propriétaire."""
        serializer.save(owner=self.request.user)

    # --------------------------------------------------------
    # ACTIONS PERSONNALISÉES
    # --------------------------------------------------------

    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """Bascule le statut favori d'un contact."""
        contact = self.get_object()
        contact.is_favorite = not contact.is_favorite
        contact.save()
        return Response({
            "message": "Favori mis à jour.",
            "is_favorite": contact.is_favorite,
        })

    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        """Met un contact à la corbeille (soft delete)."""
        contact = self.get_object()
        contact.is_deleted = True
        contact.deleted_at = timezone.now()
        contact.save()
        return Response({"message": "Contact déplacé dans la corbeille."})

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restaure un contact depuis la corbeille."""
        contact = self.get_object()
        contact.is_deleted = False
        contact.deleted_at = None
        contact.save()
        return Response({"message": "Contact restauré."})

    @action(detail=True, methods=['delete'])
    def hard_delete(self, request, pk=None):
        """Supprime définitivement un contact."""
        contact = self.get_object()
        contact.delete()
        return Response({"message": "Contact supprimé définitivement."},
                        status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def empty_trash(self, request):
        """Vide toute la corbeille de l'utilisateur connecté."""
        deleted_count, _ = Contact.objects.filter(
            owner=request.user,
            is_deleted=True
        ).delete()
        return Response({
            "message": f"{deleted_count} contact(s) supprimé(s) définitivement.",
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques pour le tableau de bord."""
        user = request.user
        active = Contact.objects.filter(owner=user, is_deleted=False)
        return Response({
            "total": active.count(),
            "favorites": active.filter(is_favorite=True).count(),
            "categories": Category.objects.filter(owner=user).count(),
            "trash": Contact.objects.filter(owner=user, is_deleted=True).count(),
        })

# ============================================================
# IMPORT / EXPORT CSV
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_contacts_csv(request):
    """
    Exporte tous les contacts actifs de l'utilisateur au format CSV.
    GET /api/contacts/export/
    """
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="contacts.csv"'

    # BOM UTF-8 pour qu'Excel affiche correctement les accents
    response.write('\ufeff')

    writer = csv.writer(response, delimiter=';')
    writer.writerow([
        'Prénom', 'Nom', 'Email', 'Téléphone', 'Adresse', 'Ville',
        'Entreprise', 'Fonction', 'Catégorie', 'Notes', 'Favori'
    ])

    contacts = Contact.objects.filter(
        owner=request.user, is_deleted=False
    ).select_related('category')

    for c in contacts:
        writer.writerow([
            c.first_name, c.last_name, c.email, c.phone, c.address, c.city,
            c.company, c.job_title,
            c.category.name if c.category else '',
            c.notes,
            'Oui' if c.is_favorite else 'Non',
        ])

    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_contacts_csv(request):
    """
    Importe des contacts depuis un fichier CSV.
    POST /api/contacts/import/
    Form-data : file=<fichier.csv>
    """
    file = request.FILES.get('file')
    if not file:
        return Response(
            {"error": "Aucun fichier fourni."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not file.name.lower().endswith('.csv'):
        return Response(
            {"error": "Le fichier doit être un CSV."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Décoder en UTF-8 (avec BOM toléré)
        decoded = file.read().decode('utf-8-sig')
    except UnicodeDecodeError:
        return Response(
            {"error": "Encodage invalide. Utilisez UTF-8."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Détecter automatiquement le séparateur
    sniffer = csv.Sniffer()
    try:
        dialect = sniffer.sniff(decoded[:1024], delimiters=';,\t')
        delimiter = dialect.delimiter
    except csv.Error:
        delimiter = ';'

    reader = csv.DictReader(io.StringIO(decoded), delimiter=delimiter)

    created = 0
    skipped = 0
    errors = []

    for i, row in enumerate(reader, start=2):  # start=2 car ligne 1 = en-têtes
        # Récupération souple des colonnes (FR ou EN, minuscules ou majuscules)
        def get(*keys):
            for k in keys:
                for rk in row.keys():
                    if rk and rk.strip().lower() == k.lower():
                        return (row[rk] or '').strip()
            return ''

        first_name = get('Prénom', 'prenom', 'first_name', 'firstname')
        last_name = get('Nom', 'last_name', 'lastname')
        email = get('Email', 'mail', 'e-mail')

        if not first_name or not last_name or not email:
            errors.append(f"Ligne {i} : prénom, nom et email sont obligatoires.")
            skipped += 1
            continue

        # Détection doublon
        if Contact.objects.filter(
            owner=request.user, email__iexact=email, is_deleted=False
        ).exists():
            errors.append(f"Ligne {i} : email déjà existant ({email}).")
            skipped += 1
            continue

        # Catégorie (créée automatiquement si absente)
        category_name = get('Catégorie', 'categorie', 'category')
        category = None
        if category_name:
            category, _ = Category.objects.get_or_create(
                owner=request.user,
                name=category_name,
                defaults={'color': '#3B82F6'}
            )

        favorite_raw = get('Favori', 'favorite', 'favori').lower()
        is_favorite = favorite_raw in ('oui', 'yes', 'true', '1', 'vrai')

        Contact.objects.create(
            owner=request.user,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=get('Téléphone', 'telephone', 'phone'),
            address=get('Adresse', 'address'),
            city=get('Ville', 'city'),
            company=get('Entreprise', 'company'),
            job_title=get('Fonction', 'job_title', 'job'),
            category=category,
            notes=get('Notes', 'note'),
            is_favorite=is_favorite,
        )
        created += 1

    return Response({
        "message": f"{created} contact(s) importé(s), {skipped} ignoré(s).",
        "created": created,
        "skipped": skipped,
        "errors": errors[:20],   # max 20 erreurs pour ne pas surcharger
    })