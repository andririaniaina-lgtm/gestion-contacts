from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Category, Contact


# AUTHENTIFICATION

class UserSerializer(serializers.ModelSerializer):
    """Pour renvoyer les infos de l'utilisateur connecté."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    """Pour créer un nouveau compte utilisateur."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Les deux mots de passe ne correspondent pas."}
            )
        return attrs

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'],
        )
        return user


# CATEGORY

class CategorySerializer(serializers.ModelSerializer):
    """Serializer pour les catégories."""
    contacts_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'contacts_count', 'created_at']
        read_only_fields = ['id', 'created_at', 'contacts_count']

    def get_contacts_count(self, obj):
        """Nombre de contacts non supprimés dans cette catégorie."""
        return obj.contacts.filter(is_deleted=False).count()

    def validate_name(self, value):
        """Vérifie qu'une catégorie du même nom n'existe pas déjà pour cet user."""
        user = self.context['request'].user
        qs = Category.objects.filter(owner=user, name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Vous avez déjà une catégorie avec ce nom.")
        return value


# CONTACT

class ContactSerializer(serializers.ModelSerializer):
    """Serializer complet pour les contacts."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Contact
        fields = [
            'id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'address', 'city',
            'company', 'job_title',
            'category', 'category_name', 'category_color',
            'notes', 'photo',
            'is_favorite', 'is_deleted', 'deleted_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'deleted_at', 'full_name']

    def validate_category(self, value):
        """Empêche d'assigner une catégorie qui n'appartient pas à l'utilisateur."""
        if value is not None and value.owner != self.context['request'].user:
            raise serializers.ValidationError("Cette catégorie ne vous appartient pas.")
        return value

    def validate(self, attrs):
        """Détection des doublons (email + owner)."""
        user = self.context['request'].user

        # Récupérer l'email (nouveau ou existant si update partiel)
        email = attrs.get('email', getattr(self.instance, 'email', None))

        if email:
            qs = Contact.objects.filter(
                owner=user,
                email__iexact=email,
                is_deleted=False
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"email": "Vous avez déjà un contact actif avec cet email."}
                )
        return attrs