# Generated by Django 4.2.14 on 2025-01-01 04:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('exercise', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exercise',
            name='favorited_by',
        ),
    ]
