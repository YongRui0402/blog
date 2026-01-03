---
layout: page
title: Wiki
description: 知識就是力量
keywords: 維基, Wiki
comments: false
menu: 維基
permalink: /wiki/
---

記多少命令和快捷鍵會讓腦袋爆炸呢？

<ul class="listing">
{% for wiki in site.wiki %}
    {% if wiki.title != "Wiki Template" %}
    <li class="listing-item">
        <a href="{{ wiki.url }}">{{ wiki.title }}</a>
    </li>
    {% endif %}
{% endfor %}
</ul>

<ul class="listing">
{% for tool in site.tool %}
    {% if tool.title != "tool Template" %}
    <li class="listing-item">
        <a href="{{ tool.url }}">{{ tool.title }}</a>
    </li>
    {% endif %}
{% endfor %}
</ul>

