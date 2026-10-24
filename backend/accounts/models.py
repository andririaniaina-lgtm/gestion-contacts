from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


class Category(models.Model):
    """
    Catégorie de contacts (ex : Travail, Famille, Amis...).
    Chaque catégorie appartient à un seul utilisateur.
    """
    name = models.CharField(max_length=50)
    color = models.CharField(
        max_length=7,
        default='#3B82F6',
        help_text="Couleur hexadécimale (ex : #3B82F6)"
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Deux catégories du même nom ne peuvent pas exister pour un même user
        unique_together = ('name', 'owner')
        ordering = ['name']
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'

    def __str__(self):
        return self.name


class Contact(models.Model):
    """
    Un contact appartient à un utilisateur.
    Il peut être mis en favori, en corbeille, ou associé à une catégorie.
    """
    # Validateur pour le téléphone : chiffres, espaces, +, -, (, )
    phone_validator = RegexValidator(
        regex=r'^\+?[0-9\s\-\(\)]{6,20}$',
        message="Numéro de téléphone invalide."
    )

    # Informations personnelles
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=254)
    phone = models.CharField(
        max_length=20,
        validators=[phone_validator],
        blank=True
    )

    # Adresse
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)

    # Professionnel
    company = models.CharField(max_length=150, blank=True)
    job_title = models.CharField(max_length=150, blank=True)

    # Relations
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contacts'
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='contacts'
    )

    # Divers
    notes = models.TextField(blank=True)
    photo = models.ImageField(upload_to='contacts/photos/', null=True, blank=True)

    # États
    is_favorite = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)  # corbeille
    deleted_at = models.DateTimeField(null=True, blank=True)

    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact'
        verbose_name_plural = 'Contacts'
        # Index pour accélérer les recherches par utilisateur
        indexes = [
            models.Index(fields=['owner', 'is_deleted']),
            models.Index(fields=['owner', 'is_favorite']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        """Retourne le nom complet."""
        return f"{self.first_name} {self.last_name}".strip()