# Generated by Django 3.2.9 on 2024-05-02 15:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_auto_20240502_2156'),
    ]

    operations = [
        migrations.AlterField(
            model_name='orderdetail',
            name='product_orders',
            field=models.ManyToManyField(related_name='product_orders', to='app.ProductOrder'),
        ),
    ]
