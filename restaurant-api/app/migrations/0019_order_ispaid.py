# Generated by Django 3.2.9 on 2024-05-20 03:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0018_auto_20240519_1254'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='isPaid',
            field=models.BooleanField(default=False),
        ),
    ]