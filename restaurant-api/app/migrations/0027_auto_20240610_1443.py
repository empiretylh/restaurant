# Generated by Django 3.2.9 on 2024-06-10 08:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0026_wasteproduct_cost'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='expense',
            name='user',
        ),
        migrations.RemoveField(
            model_name='otherincome',
            name='user',
        ),
    ]
