# Generated by Django 3.2.9 on 2024-05-04 07:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0006_alter_orderdetail_product_orders'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderdetail',
            name='guest',
            field=models.CharField(default=1, max_length=5),
        ),
    ]
