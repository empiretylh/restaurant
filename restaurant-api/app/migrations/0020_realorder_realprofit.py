# Generated by Django 3.2.9 on 2024-05-20 07:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0019_order_ispaid'),
    ]

    operations = [
        migrations.AddField(
            model_name='realorder',
            name='realProfit',
            field=models.CharField(blank=True, default=0, max_length=10, null=True),
        ),
    ]
