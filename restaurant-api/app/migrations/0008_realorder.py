# Generated by Django 3.2.9 on 2024-05-05 14:38

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0007_orderdetail_guest'),
    ]

    operations = [
        migrations.CreateModel(
            name='RealOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order_time', models.DateTimeField(auto_now_add=True)),
                ('isCooking', models.BooleanField(default=False)),
                ('isFinish', models.BooleanField(default=False)),
                ('start_cooking_time', models.DateTimeField(blank=True)),
                ('end_cooking_time', models.DateTimeField(blank=True)),
                ('orders', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.orderdetail')),
            ],
        ),
    ]
