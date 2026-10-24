from django.contrib import admin
from .models import Category, Contact


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'owner', 'created_at')
    search_fields = ('name',)
    list_filter = ('owner',)


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = (
        'first_name', 'last_name', 'email', 'phone',
        'category', 'is_favorite', 'is_deleted', 'owner'
    )
    list_filter = ('is_favorite', 'is_deleted', 'category', 'owner')
    search_fields = ('first_name', 'last_name', 'email', 'company')
    readonly_fields = ('created_at', 'updated_at')