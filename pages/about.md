---
layout: page
title: About
description: Coding is My Life
keywords: YongRui's Blog
comments: true
menu: 關於
permalink: /about/
---

YongRui's Blog

## 聯繫

{% for website in site.data.social %}
* {{ website.sitename }}：[@{{ website.name }}]({{ website.url }})
{% endfor %}

## Skill Keywords

{% for category in site.data.skills %}
### {{ category.name }}
<div class="btn-inline">
{% for keyword in category.keywords %}
<button class="btn btn-outline" type="button">{{ keyword }}</button>
{% endfor %}
</div>
{% endfor %}
