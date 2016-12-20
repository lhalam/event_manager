# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-26 20:32
from __future__ import unicode_literals

import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('event', '0010_auto_20161121_1941'),
        ('registration', '0002_auto_20161028_2141'),
    ]

    operations = [
        migrations.CreateModel(
            name='Choice',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('votes_count', models.IntegerField(default=0)),
                ('date', django.contrib.postgres.fields.ArrayField(base_field=models.DateTimeField(blank=True), blank=True, size=2)),
                ('location', django.contrib.postgres.fields.ArrayField(base_field=models.FloatField(), blank=True, size=2)),
                ('place', models.CharField(blank=True, max_length=200)),
                ('custom_value', models.CharField(blank=True, max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='ChoiceUserAssignment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('choice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='votings.Choice')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='registration.User')),
            ],
        ),
        migrations.CreateModel(
            name='Voting',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('end_date', models.DateTimeField()),
                ('type', models.CharField(max_length=20)),
                ('creation_date', models.DateTimeField(auto_now_add=True)),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='votings', related_query_name='voting', to='event.Event')),
            ],
        ),
        migrations.CreateModel(
            name='VotingUserAssignment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='registration.User')),
                ('voting', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='votings.Voting')),
            ],
        ),
        migrations.AddField(
            model_name='voting',
            name='voters',
            field=models.ManyToManyField(through='votings.VotingUserAssignment', to='registration.User'),
        ),
        migrations.AddField(
            model_name='choice',
            name='voters',
            field=models.ManyToManyField(through='votings.ChoiceUserAssignment', to='registration.User'),
        ),
        migrations.AddField(
            model_name='choice',
            name='voting',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='choices', related_query_name='choice', to='votings.Voting'),
        ),
    ]
