// ==UserScript==
// @name         Moodle to discord
// @namespace    http://tampermonkey.net/
// @version      2024-10-19
// @description  Moodle to discord
// @author       xcvrys
// @match        https://moodle2.e-wsb.pl/mod/quiz/review.php**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=e-wsb.pl
// @require      file://C:\Users\kamil\Desktop\moodle-discord\main.js
// ==/UserScript==

(function() {
    'use strict';

    const DISCORD_WEBHOOK_URL = "";

    const quizTitle = document.querySelector('.breadcrumb-item a').innerHTML;

    function sendMessage(message, answer) {
        const formattedOptions = message.options.map((option, index) => {
            const isCorrect = answer ? option.includes(answer) : false;
            return `${String.fromCharCode(97 + index)}: ${isCorrect ? `**${option}**` : option}`;
        }).join('\n');

        fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                embeds: [{
                    title: quizTitle,
                    fields: [
                        {
                            name: "Pytanie",
                            value: message.question
                        },
                        {
                            name: "Opcje",
                            value: formattedOptions
                        },
                        {
                            name: "Poprawna odpowiedź",
                            value: answer || "Nie znaleziono poprawnej odpowiedzi"
                        }
                    ],
                    color: 27135
                }]
            })
        })
            .then(response => response.json())
            .then(data => console.log("Message sent successfully", data))
            .catch(error => console.error("Error sending message", error));
    }

    function messageManager(messages, answers) {
        for (let i = 0; i < messages.length; i++) {
            sendMessage(messages[i], answers[i] || null);
        }
    }

    function getQuestions() {
        const formulationDivs = document.querySelectorAll('.formulation.clearfix');
        const answersDivs = document.querySelectorAll('.rightanswer');
        if (!formulationDivs.length || !answersDivs.length) return;

        const messages = [];
        const answers = [];

        formulationDivs.forEach((formulationDiv) => {
            let message = {};

            const questionText = formulationDiv.querySelector('.qtext');
            message.question = questionText ? questionText.textContent.trim() : "Brak pytania";

            const answerOptions = Array.from(formulationDiv.querySelectorAll('.answer div.d-flex.w-auto')).map(answerDiv => {
                const answerTextElement = answerDiv.querySelector('div.flex-fill.ml-1');
                return answerTextElement ? answerTextElement.textContent.trim() : '';
            }).filter(text => text);

            messages.push({
                question: message.question,
                options: answerOptions
            });
        });

        answersDivs.forEach((answerdiv) => {
            const answerText = answerdiv.innerHTML.split("to: ")[1];
            answers.push(answerText ? answerText.trim() : null);
        });

        messageManager(messages, answers);
    }

    getQuestions();
})();
