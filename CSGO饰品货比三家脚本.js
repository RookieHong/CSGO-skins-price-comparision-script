﻿// ==UserScript==
// @name         CSGO饰品价格对比脚本
// @connect      *
// @version      1.7
// @description  将各个CSGO饰品交易平台的价格放在一起显示，省去打开多个网页的繁琐操作！
// @author       RookieHong
// @grant        GM_xmlhttpRequest
// @match        https://www.c5game.com/csgo/default/*
// @match        https://www.igxe.cn/csgo/*
// @match        https://buff.163.com/market/?game=csgo*
// @match        https://www.v5fox.com/csgo*
// @require      https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js
// ==/UserScript==

//去除名字中的所有空格
function Trim(str) {
    return str.replace(/\s*/g, "");
}

//用来替代GM_addStyle的方法
function addStyle(cssStr) {
    try {
        let node = document.createElement('style');
        node.textContent = cssStr;
        document.querySelector(':root').appendChild(node);
    } catch (e) { }
}

//生成表单内容的json结构体
$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a,
    function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

//IGXE上的生成下一页链接的函数
function IGXE_gen_url(url, params) {
    var new_params = {};
    var new_params_length = 0;
    for (var key in params) {
        if (params[key]) {
            new_params[key] = params[key];
            new_params_length += 1;
        }
    }
    if (new_params_length <= 0) {
        return url;
    }

    return url + '?' + jQuery.param(new_params);
};

$(document).ready(function () {
    var myScriptStyle = '.myTitle {font-weight: bold;} \
                        .mySum {color: #429605;}\
                        .myPrice{color: #0b84d3;}\
                        .c5li{margin: 0px!important;white-space: nowrap; font-size: 12px;}\
                        .igli{padding:4px; font-size: 12px; white-space: nowrap;}\
                        .buffli{ width:auto!important; height: auto!important; float:none!important; margin: 0px!important; padding:4px!important; font-size: 12px; white-space: nowrap; border: inherit!important; border-radius: 0!important; background: #959595!important; }\
                        .buffli a{background: #959595!important; text-align: left!important;}\
                        .v5li {padding: 4px; font-size: 12px; white-space: nowrap;}';
    myScriptStyle = myScriptStyle + '/* 容器 <div> - 需要定位下拉内容 */\
    .dropdown {\
        position: relative;\
        display: inline-block;\
    }\
\
    /* 下拉内容 (默认隐藏) */\
    .igxe-dropdown-content {\
        display: none;\
        position: absolute;\
        background-color: #1c2734!important;\
        min-width: 160px;\
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);\
        z-index: 9999;\
    }\
\
    /* 下拉菜单的链接 */\
    .igxe-dropdown-content a {\
        color: white;\
        padding: 12px 16px;\
        text-decoration: none;\
        display: block;\
    }\
    \
    /* 鼠标移上去后修改下拉菜单链接颜色 */\
    .igxe-dropdown-content a:hover {background-color: #313d4d!important;}\
    \
    /* 下拉内容 (默认隐藏) */\
    .buff-dropdown-content {\
        display: none;\
        position: absolute;\
        background-color: #1c2734!important;\
        min-width: 160px;\
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);\
        z-index: 9999;\
    }\
\
    /* 下拉菜单的链接 */\
    .buff-dropdown-content a {\
        color: white;\
        padding: 12px 16px;\
        text-decoration: none;\
        display: block;\
    }\
    \
    /* 鼠标移上去后修改下拉菜单链接颜色 */\
    .buff-dropdown-content a:hover {background-color: #f2efef!important;}\
    \
    /* 下拉内容 (默认隐藏) */\
    .v5-dropdown-content {\
        display: none;\
        position: absolute;\
        background-color: #1c2734!important;\
        min-width: 160px;\
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);\
        z-index: 9999;\
    }\
\
    /* 下拉菜单的链接 */\
    .v5-dropdown-content a {\
        color: white;\
        padding: 12px 16px;\
        text-decoration: none;\
        display: block;\
    }\
    \
    /* 鼠标移上去后修改下拉菜单链接颜色 */\
    .v5-dropdown-content a:hover {background-color: #313d4d!important;}';
    addStyle(myScriptStyle);

    if (location.href.indexOf('c5game.com') > 0) {
        c5();
    }
    else if (location.href.indexOf('igxe.cn') > 0) {
        igxe();
    }
    else if (location.href.indexOf('buff.163.com') > 0) {
        buff();
    }
    else if (location.href.indexOf('v5fox.com') > 0) {
        v5fox();
    }
});

function addC5(c5URL, li, itemName) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: c5URL,
        onload: function (response) {
            var doc = (new DOMParser).parseFromString(response.responseText, 'text/html');
            var body = doc.querySelector('body');
            var items = $(body).find('.tab-content').find('li.selling');
            var hasNextPage = $(body).find('.pagination').find('.next').length == 0 ? false : true;
            for (var i = 0; i < items.length; i++) {
                var name = $(items[i]).find('.name').find('a').find('span').text();
                if (Trim(name) == Trim(itemName)) {
                    var url = 'https://www.c5game.com' + $(items[i]).find('a').attr('href');
                    var sum = $(items[i]).find('.info').find('.num').text().trim();
                    var price = $(items[i]).find('.info').find('.pull-left').find('.price').text();
                    $(li).html('<a href="' + url + '" style="padding: 0px"><span class="myTitle">C5：</span>' + '在售数量：<span class="mySum">' + sum + '</span>售价：<span class="myPrice">' + price + '</span></a>');
                    return;
                }
            }
            if (!hasNextPage) $(li).html('<a href="javascript:return false;" style="padding: 0px"><span class="myTitle">C5：</span><span style="color: #FF0000">查找不到数据！</span></a>');  //若没有下一页则可以判断没有该物品的数据
            else {
                var cur_page = $(body).find('.pagination').find('.active').find('a').text();
                var next_page = cur_page + 1;
                var url = 'https://www.c5game.com/csgo/default/result.html?k=' + itemName + '&page=' + next_page;
                addC5(url, li, itemName);
            }
        }
    })
}

function addIGXE(igxeURL, li, itemName) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: igxeURL,
        onload: function (response) {
            var doc = (new DOMParser).parseFromString(response.responseText, 'text/html');
            var body = doc.querySelector('body');
            var items = $(body).find(".dataList").find('.single');
            var hasNextPage = $(body).find('#page-content .next').length == 0 ? false : true;   //判断是否有下一页
            for (var i = 0; i < items.length; i++) {
                var name = $(items[i]).find('div.name').text().trim();
                if (Trim(name) == Trim(itemName)) {
                    var url = 'https://www.igxe.cn' + $(items[i]).attr('href');
                    var sum = $(items[i]).find('div.clearfix').find('div.sum').text().trim();
                    var price = $(items[i]).find('div.clearfix').find('div.price').find('span').text().trim() + $(items[i]).find('div.clearfix').find('div.price').find('sub').text().trim();
                    $(li).html('<a href="' + url + '" style="padding: 0px"><span class="myTitle">IGXE：</span>' + '在售数量：<span class="mySum">' + sum + '</span>售价：<span class="myPrice">' + price + '</span></a>');
                    return;
                }
            }
            if (!hasNextPage) $(li).html('<a href="javascript:return false;" style="padding: 0px"><span class="myTitle">IGXE：</span><span style="color: #FF0000">查找不到数据！</span></a>');  //若没有下一页则可以判断没有该物品的数据
            else {  //走igxe网站的流程到下一页查询
                var page_no = $(body).find('#page-content .next').attr("page_no");  //获取下一页的页号
                var url_param = $(body).find('#params_form').serializeObject(); //params_form是网站上的一个隐藏元素，存放各种表单信息
                url_param['page_no'] = page_no; //把里面的page_no项换成下一页
                url_param['_t'] = new Date().getTime(); //得到当前时间戳
                var url = "/csgo/730";
                url = 'https://www.igxe.cn' + IGXE_gen_url(url, url_param);
                addIGXE(url, li, itemName); //递归调用该函数直到找到该物品
            }
        }
    });
}

function addBUFF(buffURL, li, itemName) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: buffURL,
        onload: function(response) {
            var data = $.parseJSON(response.responseText);
            data = data.data;
            for (var i = 0; data.items != 'undefined' && i < data.items.length; i++) {
                var name = data.items[i].name;
                if (Trim(name) == Trim(itemName)) {
                    var url = 'https://buff.163.com/market/goods?goods_id=' + data.items[i].id + '&from=market#tab=selling';
                    var sum = data.items[i].sell_num;
                    var price = '￥' + data.items[i].sell_min_price;
                    $(li).html('<a href="' + url + '" style="padding: 0px"><span class="myTitle">BUFF：</span>' + '在售数量：<span class="mySum">' + sum + '</span>售价：<span class="myPrice">' + price + '</span></a>');
                    return;
                }
            }
            var total_pages = data.total_page;
            var cur_page = data.page_num;
            if (cur_page >= total_pages) $(li).html('<a href="javascript:return false;" style="padding: 0px"><span class="myTitle">BUFF：</span><span style="color: #FF0000">查找不到数据！</span></a>');
            else {
                var next_page = cur_page + 1;
                var url = 'https://buff.163.com/api/market/goods?game=csgo&page_num=' + next_page + '&search=' + itemName.trim() + '&_=' + (new Date()).valueOf().toString();
                addBUFF(url, li, itemName);
            }
        }
    });
}

function addV5(v5URL, li, itemName) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: v5URL,
        onload: function (response) {
            var doc = (new DOMParser).parseFromString(response.responseText, 'text/html');
            var body = doc.querySelector('body');
            var items = $(body).find(".list-box").find('a');
            var hasNextPage = $(body).find('.laypage_next').length == 0 ? false : true;   //判断是否有下一页
            for (var i = 0; i < items.length; i++) {
                var name = $(items[i]).find('div.list-item-top').find('div.list-text-box').find('h5').text().trim();
                if (Trim(name) == Trim(itemName)) {
                    var url = 'https://www.v5fox.com' + $(items[i]).attr('href');
                    var sum = $(items[i]).find('div.list-item-bot').find('div.r').text().trim();
                    var price = $(items[i]).find('div.list-item-top').find('div.list-text-box').find('p').find('span').text().trim();
                    $(li).html('<a href="' + url + '" style="padding: 0px"><span class="myTitle">V5FOX：</span>' + '在售数量：<span class="mySum">' + sum + '</span>售价：<span class="myPrice">' + price + '</span></a>');
                    return;
                }
            }
            if (!hasNextPage) $(li).html('<a href="javascript:return false;" style="padding: 0px"><span class="myTitle">V5FOX：</span><span style="color: #FF0000">查找不到数据！</span></a>');
            else {
                var cur_page = $('.laypage_curr').text();
                var next_page = cur_page + 1;
                var url = 'https://www.v5fox.com/csgo/0-0?keyword=' + itemName + '&pageNum=' + next_page;
                addV5(url, li, itemName);
            }
        }
    });
}

function c5() {
    $('.tab-content').on('mouseenter', 'li.selling', function () {
        if ($(this).find('ul').length > 0) {
            $(this).find('ul').css('max-height', 'none');
            $(this).find('ul').css('overflow', 'visible');
            return;
        }
        $(this).attr('mouseover', 'true');   //当前鼠标在该物品上
        //新创建一个列表来存放各个饰品网站的相同物品数据
        var list = $('<ul class="rm-menu rm-css-animate rm-menu-expanded" aria-hidden="false" style="max-height: 0px; display: block; overflow: hidden; padding: 0px; position: absolute; z-index: 9999; left:-0.125em"></ul>');
        var itemName = $(this).find('span.text-unique').text(); //获取该物品的名字

        var igxeURL = 'https://www.igxe.cn/csgo/730?keyword=' + itemName;
        var igxeLi = $('<li class="rm-menu-item c5li"><span class="myTitle">IGXE：</span><span>载入中...</li>');
        $(list).append(igxeLi);
        addIGXE(igxeURL, igxeLi, itemName);  //获取igxe上的数据

        var buffURL = 'https://buff.163.com/api/market/goods?game=csgo&page_num=1&search=' + itemName.trim() + '&_=' + (new Date()).valueOf().toString();
        var buffLi = $('<li class="rm-menu-item c5li"><span class="myTitle">BUFF：</span><span>载入中...</li>');
        $(list).append(buffLi);
        addBUFF(buffURL, buffLi, itemName);  //获取BUFF上的数据

        var v5URL = 'https://www.v5fox.com/csgo/0-0?keyword=' + itemName;
        var v5Li = $('<li class="rm-menu-item c5li"><span class="myTitle">BUFF：</span><span>载入中...</li>');
        $(list).append(v5Li);
        addV5(v5URL, v5Li, itemName);  //获取V5FOX上的数据

        if ($(this).attr('mouseover') == 'true') {   //若鼠标还在该物品上就不隐藏刚创建的列表
            $(list).css('max-height', 'none');
            $(list).css('overflow', 'visible');
        }
        $(this).append(list);
    });

    $('.tab-content').on('mouseleave', 'li', function () {
        if ($(this).find('ul').length > 0) {
            $(this).find('ul').css('max-height', '0px');
            $(this).find('ul').css('overflow', 'hidden');
        }
        $(this).attr('mouseover', 'false');
    });
}

function igxe() {
    $('.dataList').on('mouseenter', 'a.single', function () {
        if ($(this).find('div.igxe-dropdown-content').length > 0) {
            $(this).find('div.igxe-dropdown-content').css('display', 'block');
            return;
        }

        $(this).css({
            display: 'inline - block'
        });
        $(this).attr('mouseover', 'true');   //当前鼠标在该物品上

        var list = $('<div class="igxe-dropdown-content"></div>');
        var itemName = $(this).find('div.name').attr('title');

        var c5URL = 'https://www.c5game.com/csgo/default/result.html?k=' + itemName + '&page=1';
        var c5Li = $('<li class="igli"><span class="myTitle">C5：</span><span>载入中...</li>');
        $(list).append(c5Li);
        addC5(c5URL, c5Li, itemName);  //获取C5上的数据

        var buffURL = 'https://buff.163.com/api/market/goods?game=csgo&page_num=1&search=' + itemName.trim() + '&_=' + (new Date()).valueOf().toString();
        var buffLi = $('<li class="igli"><span class="myTitle">BUFF：</span><span>载入中...</li>');
        $(list).append(buffLi);
        addBUFF(buffURL, buffLi, itemName);  //获取BUFF上的数据

        var v5URL = 'https://www.v5fox.com/csgo/0-0?keyword=' + itemName;
        var v5Li = $('<li class="igli"><span class="myTitle">V5FOX：</span><span>载入中...</li>');
        $(list).append(v5Li);
        addV5(v5URL, v5Li, itemName);  //获取V5FOX上的数据

        if ($(this).attr('mouseover') == 'true') {   //若鼠标还在该物品上就不隐藏刚创建的列表
            $(list).css('display', 'block');
        }
        $(this).append(list);
    });

    $('.dataList').on('mouseleave', 'a.single', function () {
        if ($(this).find('div.igxe-dropdown-content').length > 0) {
            $(this).find('div.igxe-dropdown-content').css('display', 'none');
            return;
        }
        $(this).attr('mouseover', 'false');
    });
}

function buff() {
    $('#j_market_card').on('mouseenter', '#j_list_card li:not([class])', function () {
        if ($(this).find('div.buff-dropdown-content').length > 0) {
            $(this).find('div.buff-dropdown-content').css('display', 'block');
            return;
        }

        $(this).css({
            display: 'inline - block'
        });
        $(this).attr('mouseover', 'true');   //当前鼠标在该物品上

        var list = $('<div class="buff-dropdown-content"></div>');
        var itemName = $(this).find('a:first').attr('title');

        var c5URL = 'https://www.c5game.com/csgo/default/result.html?k=' + itemName + '&page=1';
        var c5Li = $('<li class="buffli"><span class="myTitle">C5：</span><span>载入中...</li>');
        $(list).append(c5Li);
        addC5(c5URL, c5Li, itemName);  //获取C5上的数据

        var igxeURL = 'https://www.igxe.cn/csgo/730?keyword=' + itemName;
        var igxeLi = $('<li class="buffli"><span class="myTitle">IGXE：</span><span>载入中...</li>');
        $(list).append(igxeLi);
        addIGXE(igxeURL, igxeLi, itemName);  //获取igxe上的数据

        var v5URL = 'https://www.v5fox.com/csgo/0-0?keyword=' + itemName;
        var v5Li = $('<li class="buffli"><span class="myTitle">V5FOX：</span><span>载入中...</li>');
        $(list).append(v5Li);
        addV5(v5URL, v5Li, itemName);  //获取V5FOX上的数据

        if ($(this).attr('mouseover') == 'true') {   //若鼠标还在该物品上就不隐藏刚创建的列表
            $(list).css('display', 'block');
        }
        $(this).append(list);
    });

    $('#j_market_card').on('mouseleave', '#j_list_card li:not([class])', function () {
        if ($(this).find('div.buff-dropdown-content').length > 0) {
            $(this).find('div.buff-dropdown-content').css('display', 'none');
            return;
        }
        $(this).attr('mouseover', 'false');
    });
}

function v5fox() {
    $('.list-box').on('mouseenter', 'a.list-item', function () {
        if ($(this).find('div.v5-dropdown-content').length > 0) {
            $(this).find('div.v5-dropdown-content').css('display', 'block');
            return;
        }

        $(this).css({
            display: 'inline - block'
        });
        $(this).attr('mouseover', 'true');   //当前鼠标在该物品上

        var list = $('<div class="v5-dropdown-content"></div>');
        var itemName = $(this).attr('title');

        var c5URL = 'https://www.c5game.com/csgo/default/result.html?k=' + itemName + '&page=1';
        var c5Li = $('<li class="v5li"><a href="javascript:return false;" style="padding: 0px"><span class="myTitle">C5：</span><span>载入中...</a></li>');
        $(list).append(c5Li);
        addC5(c5URL, c5Li, itemName);  //获取C5上的数据

        var buffURL = 'https://buff.163.com/api/market/goods?game=csgo&page_num=1&search=' + itemName.trim() + '&_=' + (new Date()).valueOf().toString();
        var buffLi = $('<li class="v5li"><a href="javascript:return false;" style="padding: 0px"><span class="myTitle">BUFF：</span><span>载入中...</a></li>');
        $(list).append(buffLi);
        addBUFF(buffURL, buffLi, itemName);  //获取BUFF上的数据

        var igxeURL = 'https://www.igxe.cn/csgo/730?keyword=' + itemName;
        var igxeLi = $('<li class="v5li"><a href="javascript:return false;" style="padding: 0px"><span class="myTitle">IGXE：</span><span>载入中...</a></li>');
        $(list).append(igxeLi);
        addIGXE(igxeURL, igxeLi, itemName);  //获取igxe上的数据

        if ($(this).attr('mouseover') == 'true') {   //若鼠标还在该物品上就不隐藏刚创建的列表
            $(list).css('display', 'block');
        }
        $(this).append(list);
    });

    $('.list-box').on('mouseleave', 'a.list-item', function () {
        if ($(this).find('div.v5-dropdown-content').length > 0) {
            $(this).find('div.v5-dropdown-content').css('display', 'none');
            return;
        }
        $(this).attr('mouseover', 'false');
    });
}