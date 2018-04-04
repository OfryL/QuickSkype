// ==UserScript==
// @name					QuickSkype
// @description		Adding 'send message via Skype' link near person`s name.
// @namespace  		https://emea.panaya.com
// @include       https://emea.panaya.com/*
// @require 			http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @version    		1.1
// ==/UserScript==

const config = {
    debug: true,
    showMsg: true,
    checkInterval: 3000,
    maxTicks: 5
};

const assets = {
    notificationMsgHtml: '<div><img src="https://secure.skypeassets.com/i/common/images/icons/favicon.ico" alt="Skype chat, instant message" style="height: 16px; width: 16px; border:0; margin:0;"> Skype Contacts has been found!</div>',
    buttonHTML: '<a href="sip:{{email}}"><img src="https://www.skypeassets.com/i/scom/images/skype-buttons/chatbutton_16px.png" alt="Skype chat, instant message" role="Button" style="border:0; margin:0;"></a>',
    selectors: "div[type='label'][property='fullName'], " +
    "div[type='label'][property='createdBy'], " +
    "div[type='assign to'], div[type='user']"
};

var checkTimer;
var ticksCounter = 0;
var isElementsFound = false;


this.$ = this.jQuery = jQuery.noConflict(true);

function logMsg(lvl, txt) {
    // GM_log(txt);
    // return;
    if (config['debug']) {
        if (lvl == 'in') {
            console.info(txt);
        } else if (lvl == 'wa') {
            console.warn(txt);
        } else if (lvl == 'er') {
            console.error(txt);
        }
    }
}

function extractedMailFromEntity(entity) {
    var email = entity['email'];
    if (!email) {
        email = entity['assignToMail'];
    }
    return email;
}

function tryExtractedMail(contactDiv) {
    var entity = $(contactDiv).scope().entity;
    return extractedMailFromEntity(entity);
}

function formatDivWithNewButton(contactDiv) {
    if (contactDiv) {
        var email = tryExtractedMail(contactDiv);
        if (email) {
            contactDiv.innerHTML += assets['buttonHTML'].replace('{{email}}', email);
            isElementsFound = true;
        } else {
            logMsg('wa', "No mail found");
        }
    }
}

function stopTimer() {
    clearInterval(checkTimer); // run only once
    logMsg('in', "timer stopped");
}

function notifyMsg() {
    if (config['showMsg']) {
        $.notify({html: assets['notificationMsgHtml']}, {
            className: 'success',
            globalPosition: "top middle",
            style: "html"
        });
        logMsg('in', "notification showed");
    }
}

function stopTimerOverFlow() {
    ticksCounter++;
    if (ticksCounter === config['maxTicks']) {
        if (isElementsFound) {
            notifyMsg();
        } else {
            logMsg('in', 'No elements found')
        }
        logMsg('in', "max ticksCounter reached");
        stopTimer();
    }
}

function checkForUpdate() {
    logMsg('in', "looking for elements...");
    var elements = $(assets['selectors']);
    logMsg('in', elements.size() + " elements found");

    elements.each(function () {
        stopTimer();
        logMsg('in', "processing new element");
        formatDivWithNewButton(this);
    });
}

logMsg('in', "script started");
$(document).ready(function() {
    logMsg('in', "doc ready");
    function timerInterval() {
        logMsg('in', "tick");
        stopTimerOverFlow();
        checkForUpdate();
    }
    checkTimer = setInterval(timerInterval, config['checkInterval']);
});