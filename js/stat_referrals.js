loadSettings().then(() => {
    handleReferralsPage();
});

async function loadSettings() {
    const result = await chrome.storage.local.get("settings");
    userSettings = result.settings || {}; // Сохраняем настройки в глобальную переменную
}

function handleReferralsPage() {
    if (!userSettings.isReferralsSummary) return;

    const trElements = document.querySelectorAll('tbody tr');

    if (trElements && trElements.length > 0) {
        const [totalSpent, totalClaimed] = calculateSpentAndClaimed(trElements);
        setSpendAndClaimedLabels(totalSpent, totalClaimed);
    }
}


function setSpendAndClaimedLabels(totalSpent, totalClaimed) {
    const tableClass = document.querySelector("thead")
    const trElement = document.createElement('tr');

    const tdDate = document.createElement('td');
    trElement.appendChild(tdDate);

    const tdSpent = document.createElement('td');
    tdSpent.textContent = `${totalSpent} ₽`;
    trElement.appendChild(tdSpent);

    const tdClaimed = document.createElement('td');
    tdClaimed.textContent = `${totalClaimed}₽`;
    trElement.appendChild(tdClaimed);

    tableClass.insertAdjacentElement("afterbegin", trElement);
}

function calculateSpentAndClaimed(trElements) {
    const spent = [];
    const claimed = [];

    trElements.forEach(row => {
        const tdElements = row.querySelectorAll('td');
        if (tdElements.length === 3) {
            // Добавляем значения во соответствующие массивы
            spent.push(parseFloat(tdElements[1].textContent));
            claimed.push(parseFloat(tdElements[2].textContent));
        } else {
            console.log("В стате почему-то больше 3х td элементов")
        }
    });

    const totalSpent = parseFloat(spent.reduce((acc, curr) => acc + curr, 0)).toFixed(2);
    const totalClaimed = parseFloat(claimed.reduce((acc, curr) => acc + curr, 0)).toFixed(2);


    return [totalSpent, totalClaimed];
}