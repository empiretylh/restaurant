# Generated by Django 3.2.9 on 2024-05-20 07:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0020_realorder_realprofit'),
    ]

    operations = [
        migrations.AlterField(
            model_name='realorder',
            name='totalPayment',
            field=models.CharField(blank=True, default=0, max_length=10, null=True),
        ),
    ]