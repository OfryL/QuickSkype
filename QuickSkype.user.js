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
    maxTicks: 5,
    delayedStart: 1000
};

const assets = {
    notificationMsgHtml: '<div><img src="https://secure.skypeassets.com/i/common/images/icons/favicon.ico" alt="Skype chat, instant message" style="height: 16px; width: 16px; border:0; margin:0;"> Skype Contacts has been found!</div>',
    buttonHTML: '<a href="sip:{{email}}"><img src="https://www.skypeassets.com/i/scom/images/skype-buttons/chatbutton_16px.png" alt="Skype chat, instant message" role="Button" style="border:0; margin:0;"></a>',
    selectors: "div[type='label'][property='fullName'], " +
    "div[type='label'][property='createdBy'], " +
    "div[type='assign to'], div[type='user']"
};

var checkTimer;
var isElementsFound = false;


this.$ = this.jQuery = jQuery.noConflict(true);

function logDebugMsg(lvl, txt) {
    if (config['debug']) {
        if (lvl == 'i') {
            console.info(txt);
        } else if (lvl == 'w') {
            console.warn(txt);
        } else if (lvl == 'e') {
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
    debugger;
    return extractedMailFromEntity(entity);
}

function formatDivWithNewButton(contactDiv) {
    logDebugMsg('i', ("trying to format " + contactDiv));
    if (contactDiv) {
        var email = tryExtractedMail(contactDiv);
        if (email) {
            logDebugMsg('i', email + "Mail found");
            contactDiv.innerHTML += assets['buttonHTML'].replace('{{email}}', email);
            isElementsFound = true;
        } else {
            logDebugMsg('w', "No mail found");
        }
    }
}

function stopTimer() {
    clearInterval(checkTimer); // run only once
    logDebugMsg('i', "timer stopped");
}

function notifyMsg() {
    if (config['showMsg']) {
        $.notify({html: assets['notificationMsgHtml']}, {
            className: 'success',
            globalPosition: "top middle",
            style: "html"
        });
        logDebugMsg('i', "notification showed");
    }
}

var ticksCounter = 0;
function stopTimerOverFlow() {
    ticksCounter++;
    if (ticksCounter === config['maxTicks']) {
        if (isElementsFound) {
            notifyMsg();
        } else {
            logDebugMsg('w', 'No elements found')
        }
        logDebugMsg('w', "max ticksCounter reached");
        stopTimer();
    }
}

function checkForUpdate() {
    var elements = $(assets['selectors']);
    var elementsNumber = elements.size();
    logDebugMsg('i', elementsNumber + " elements found");

    if (!elementsNumber) {
        return;
    }

    elements.each(function (index, value)  {
        stopTimer();
        logDebugMsg('i', "processing new element");
        formatDivWithNewButton(value);
    });
}

logDebugMsg('i', "script started");
$(document).ready(function() {
    logDebugMsg('i', "doc ready");
    function timerInterval() {
        stopTimerOverFlow();
        checkForUpdate();
    }

    if (config['checkInterval']) {
        var delayedTimer = setInterval(function () {
            checkTimer = setInterval(timerInterval, config['checkInterval']);
            clearInterval(delayedTimer); // run only once
        }, config['delayedStart']);
    } else {
        checkTimer = setInterval(timerInterval, config['checkInterval']);
    }
});