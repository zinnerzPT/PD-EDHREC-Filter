// ==UserScript==
// @name         PennyDreadful EDHREC Filter
// @namespace    zinnerzPT
// @version      0.9
// @description  Hides non-legal Penny Dreadful cards in EDHREC
// @author       zinnerzPT
// @match        https://edhrec.com/*
// @grant        GM_xmlhttpRequest
// @homepageURL  https://github.com/zinnerzPT/PennyDreadfulEDHRECFilter
// @supportURL   https://github.com/zinnerzPT/PennyDreadfulEDHRECFilter/issues
// @downloadURL  https://github.com/zinnerzPT/PennyDreadfulEDHRECFilter/raw/main/PennyDreadfulEDHRECFilter.user.js
// @updateURL    https://github.com/zinnerzPT/PennyDreadfulEDHRECFilter/raw/main/PennyDreadfulEDHRECFilter.user.js
// ==/UserScript==

(function() {
    'use strict';

    let legalCardNames;

    // Hides cards based on names and the current toggle state
    function hideCardsByNames(hideCards) {
        const cardWrappers = document.querySelectorAll('[class*="CardView_cardWrapper"]');
        cardWrappers.forEach(cardWrapper => {
            let nameWrapper = cardWrapper.querySelector('[class*="Card_name"]');
            if (!nameWrapper) {
                nameWrapper = cardWrapper.querySelector('[class*="Card_nameUnderCard"]'); // if Names Under Cards option is ticked
            }
            if (nameWrapper) {
                const cardName = nameWrapper.textContent.trim();
                const isLegal = legalCardNames.includes(cardName);
                const shouldHide = hideCards ? !isLegal : false;
                cardWrapper.style.display = shouldHide ? 'none' : 'block';
            }
        });
    }

    // Creates and appends the toggle button to the navbar
    function createToggleButton(hideCards) {
        const navbar = document.querySelector('.Navbar_buttonContainer__A2QR6.navbar-nav');
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'Navbar_buttonContainer__A2QR6 toggle-container';
        const toggleButton = document.createElement('div');
        toggleButton.className = 'toggle-button';
        toggleButton.innerHTML = '<span class="toggle-label">PD Filter </span><label class="switch"><input type="checkbox" id="toggleSwitch"><span class="slider"></span></label>';
        const toggleSwitch = toggleButton.querySelector('#toggleSwitch');
        toggleSwitch.checked = hideCards;
        toggleButton.addEventListener('click', function() {
            hideCards = !hideCards;
            localStorage.setItem('hideCardsToggle', hideCards);
            toggleSwitch.checked = hideCards;
            hideCardsByNames(hideCards);
        });
        toggleContainer.appendChild(toggleButton);
        navbar.appendChild(toggleContainer);
    }

    GM_xmlhttpRequest({
        method: 'GET',
        url: 'http://pdmtgo.com/legal_cards.txt',
        onload: function(response) {
            if (response.status === 200) {
                legalCardNames = response.responseText.split('\n').map(name => name.trim());
                let hideCards = localStorage.getItem('hideCardsToggle') === 'true';
                hideCardsByNames(hideCards);
                createToggleButton(hideCards);
                window.addEventListener('scroll', function() {
                    if (localStorage.getItem('hideCardsToggle') === 'true') {
                        hideCardsByNames(true);
                    }
                });
            } else {
                console.error('Failed to fetch legal card names');
            }
        }
    });
})();
