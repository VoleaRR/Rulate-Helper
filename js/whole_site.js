loadSettings().then(() => {
    createYandexSearchButton();
    trackBalance();

});

async function loadSettings() {
    const result = await chrome.storage.local.get("settings");
    userSettings = result.settings || {}; // Сохраняем настройки в глобальную переменную
}

function trackBalance() {
    if (!userSettings.isBalanceTracking) return;

    const currentBalance = getCurrentBalance();

    if (currentBalance) {
        const currentAccountId = getcurrentAccountId();
        const clearButton = createRefreshTrackBalanceButton();
        connectClearButtonToAccount(clearButton, currentAccountId);
        handleBalanceOnUpdate(currentBalance, currentAccountId, clearButton);
    }
}


function createYandexSearchButton() {
    // Add button for yandex search
    if (!userSettings.isRedirectToYandexSearch) return;

    const btn = document.querySelector("input.btn");
    const newBtn = btn.cloneNode(true);

    newBtn.value = "ya.ru";
    newBtn.type = "button";

    btn.insertAdjacentElement("afterend", newBtn);
    newBtn.addEventListener("click", () => {
        // open in a new window yandex search page 
        const userSearchValue = document.querySelector(".input-medium.search-query.span3").value;
        if (userSearchValue) {
            const linkToYandexSearch = `https://ya.ru/search/?text=${userSearchValue}+rulate`;
            window.open(linkToYandexSearch, "_blank");
        } else {
            console.log("Ссылка не введена");
        }

    })

}

function createRefreshTrackBalanceButton() {
    // Создаем кнопку
    const button = document.createElement('button');
    button.style.width = '16px';
    button.style.height = '16px';
    button.style.paddingLeft = '0';
    button.style.border = 'none';
    button.style.background = 'none';
    button.style.cursor = 'pointer';
    button.title = "Очищает все снапшоты баланса"

    // Создаем SVG
    const svgNS = "http://www.w3.org/2000/svg"; // Пространство имен SVG
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "16px");
    svg.setAttribute("height", "16px");
    svg.setAttribute("viewBox", "0 -960 960 960");
    svg.setAttribute("fill", "#000");

    // Создаем путь внутри SVG
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z");

    // Вставляем путь в SVG
    svg.appendChild(path);

    // Вставляем SVG в кнопку
    button.appendChild(svg);
    return button
}

// Функция для сохранения баланса с проверкой времени последней записи
function saveBalanceIfNecessary(currentBalance, currentAccountId) {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000; // Время 1 час назад

    chrome.storage.local.get(['balances'], (result) => {
        let balances = result.balances || {};
        balances[currentAccountId] = balances[currentAccountId] || []; // Инициализируем массив для аккаунта, если его нет

        const accountBalances = balances[currentAccountId];

        // Проверяем, была ли последняя запись более часа назад
        const lastRecord = accountBalances.length ? accountBalances[accountBalances.length - 1] : null;

        if (!lastRecord || lastRecord.timestamp < oneHourAgo) {
            const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000; // Время 7 дней назад

            // Удаляем записи старше 7 дней
            balances[currentAccountId] = accountBalances.filter(record => record.timestamp > sevenDaysAgo);

            console.log("new balance was pushed for account:", currentAccountId, "value is", currentBalance);

            // Добавляем новый баланс
            balances[currentAccountId].push({
                balance: currentBalance,
                timestamp: now
            });

            // Сохраняем обновленный объект балансов
            chrome.storage.local.set({ balances: balances });
        }
    });
}

// Функция поиска ближайшей записи к 24 часам назад
function findClosestBalance24HoursAgo(currentAccountId, callback) {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    chrome.storage.local.get(['balances'], (result) => {
        const balances = result.balances || {};
        const accountBalances = balances[currentAccountId] || [];
        let closestRecord = null;
        let minDifference = Infinity;

        accountBalances.forEach(record => {
            const difference = Math.abs(twentyFourHoursAgo - record.timestamp);
            if (difference < minDifference) {
                minDifference = difference;
                closestRecord = record;
            }
        });

        callback(closestRecord);
    });
}

// Функция для вычисления разницы между текущим балансом и балансом 24 часа назад
function getBalanceDifference(currentBalance, currentAccountId, callback) {
    findClosestBalance24HoursAgo(currentAccountId, (closestRecord) => {
        if (closestRecord) {
            const difference = currentBalance - closestRecord.balance;
            callback(difference, closestRecord.timestamp); // Передаем разницу и время записи
        } else {
            callback(null, null); // Если данных нет
        }
    });
}

// Функция для отображения разницы балансов
function setBalanceDifference(balanceDiff, closestTimestamp, clearButton) {
    const balanceClass = document.querySelector(".main-header-balance");
    const balanceSpanClass = balanceClass.querySelector("span");
    const balanceDiffElement = balanceSpanClass.cloneNode(true);

    let prefixSymbol = "";

    if (balanceDiff < 0) {
        balanceDiffElement.style.color = 'red'; // Красный для отрицательной разницы
    } else if (balanceDiff > 0) {
        balanceDiffElement.style.color = '#00A550'; // Зеленый для положительной разницы
        prefixSymbol = "+";
    } else {
        balanceDiffElement.style.color = 'black'; // Черный для нуля
    }
    
    // Создаем элемент с подсказкой
    const tooltip = document.createElement("span");
    tooltip.classList.add("balance-tooltip");
    tooltip.style.visibility = "hidden";
    tooltip.style.position = "absolute";
    tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "5px";
    tooltip.style.borderRadius = "5px";
    tooltip.style.fontSize = "12px";
    tooltip.style.marginLeft = "8px";
    tooltip.style.zIndex = "10";

    const closestDate = new Date(closestTimestamp).toLocaleString();
    tooltip.textContent = `Сравнение с ${closestDate}`;

    // Добавляем событие для отображения подсказки при наведении
    balanceDiffElement.addEventListener("mouseover", () => {
        tooltip.style.visibility = "visible";
    });

    balanceDiffElement.addEventListener("mouseout", () => {
        tooltip.style.visibility = "hidden";
    });

    balanceDiffElement.style.marginLeft = "4px";
    balanceDiffElement.textContent = `(${prefixSymbol}${balanceDiff})`;
    balanceDiffElement.classList.add("balance-tracking")

    // Вставляем элемент на страницу
    balanceClass.appendChild(balanceDiffElement);
    balanceDiffElement.appendChild(tooltip);
    balanceDiffElement.insertAdjacentElement("afterend", clearButton);
}

function getCurrentBalance() {
    const balanceClass = document.querySelector(".main-header-balance")

    if (balanceClass) {
        const balanceStr = balanceClass.querySelector("span").textContent
        const cleanedBalanceStr = balanceStr.replace(/\s/g, '').split('.')[0];
        const balanceInt = parseInt(cleanedBalanceStr, 10);
        return balanceInt;
    }

}

function getcurrentAccountId() {
    const accountMenuClass = document.querySelector(".main-header-avatar_dropdown-menu")

    if (accountMenuClass) {
        const firstAElement = accountMenuClass.querySelector("a");
        const hrefParts = firstAElement.getAttribute("href").split("/");
        const accountId = hrefParts[hrefParts.length - 1];
        return accountId;
    }

}

// Функция для очистки данных одного аккаунта
function clearAccountData(accountId) {
    chrome.storage.local.get(['balances'], (result) => {
        let balances = result.balances || {};

        if (balances[accountId]) {
            delete balances[accountId]; // Удаляем все записи для указанного аккаунта
            chrome.storage.local.set({ balances: balances }, () => {
                console.log(`Данные аккаунта ${accountId} были удалены.`);
            });
        } else {
            console.log(`Данных для аккаунта ${accountId} не найдено.`);
        }
    });
}

// Функция для привязки кнопки к очистке данных аккаунта
function connectClearButtonToAccount(buttonObj, accountId) {
    buttonObj.addEventListener('click', () => {
        clearAccountData(accountId);
    });
}

// Основная функция для обработки обновления баланса
function handleBalanceOnUpdate(currentBalance, currentAccountId, clearButton) {
    saveBalanceIfNecessary(currentBalance, currentAccountId);

    getBalanceDifference(currentBalance, currentAccountId, (balanceDiff, closestTimestamp) => {
        if (balanceDiff !== null) {
            console.log(`Разница за 24 часа для ${currentAccountId}: ${balanceDiff > 0 ? '+' : ''}${balanceDiff}`);
            setBalanceDifference(balanceDiff, closestTimestamp, clearButton); // Передаем время записи для отображения
        } else {
            console.log('Данных для сравнения за 24 часа нет.');
        }
    });
}