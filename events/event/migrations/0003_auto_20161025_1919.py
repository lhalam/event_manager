# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-10-25 16:19
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('event', '0002_auto_20161020_1027'),
    ]

    operations = [
        migrations.CreateModel(
            name='EventUserAssignment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='event.Event')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='event',
            name='participants',
            field=models.ManyToManyField(through='event.EventUserAssignment', to=settings.AUTH_USER_MODEL),
        ),
    ]
