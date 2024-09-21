loadSettings().then(() => {
    handleBookPage();
});

async function loadSettings() {
    const result = await chrome.storage.local.get("settings");
    userSettings = result.settings || {}; // Сохраняем настройки в глобальную переменную
}

const currentUrl = window.location.href;

const bookPageRegex = /https:\/\/tl\.rulate\.ru\/book\/\d{1,}$/;
const bookChapterPageRegex = /https:\/\/tl\.rulate\.ru\/book\/\d{1,}\/\d{1,}\/(ready|ready_new)$/;
const bookEditPageRegex = /https:\/\/tl\.rulate\.ru\/book\/\d{1,}\/edit\/info$/;


function handleBookPage() {
    if (bookPageRegex.test(currentUrl)) {
        addCopyableBookId();
        setCopyableUserId();
        addButtonToEpubDownloader();

    } else if (bookChapterPageRegex.test(currentUrl)) {
        setCopyableUserId()

    } else if (bookEditPageRegex.test(currentUrl)) {
        handleBookSettingsPage();

    } else {
        console.log("Это не одна из ожидаемых страниц");
    }
}

function handleBookSettingsPage() {
    chrome.storage.local.get(['buyAdvData'], (result) => {
        if (result.buyAdvData) {
            const createdAt = result.buyAdvData.createdAt;
            const currentTime = Date.now();
            const timeDifference = (currentTime - createdAt) / 1000;

            if (timeDifference < 30) {
                buyAdvertisementOnBook();
            } else {
                console.log('Прошло больше 30 секунд, действие не выполнено.');
            }

            chrome.storage.local.remove('buyAdvData', () => {
                console.log('Объект buyAdv был удален.');
            });
        }
    });
}

function buyAdvertisementOnBook() {
    document.getElementById('advert_site-tab').click();

    const advDates = getFormattedDates();
    const advInputs = getAdvInputs();

    if (isInputsNotAllowed(advInputs)) {
        console.log("Кнопка какая-то занята числом. Скип")
        return
    };

    advInputs.startInput.value = advDates.startAdv;
    advInputs.endInput.value = advDates.endAdv;

    clickToBuyAdv();
    
}

function isInputsNotAllowed(inputs) {
    // Если в одной из кнопок уже есть какое-то значение, значит реклама там куплена и мы не можем ничего
    // сделать, поэтому возвращаем true, то есть NotAllowed и скипаем
    if (inputs.startInput.value || inputs.endInput.value) return true;
}

function clickToBuyAdv() {
    if (!userSettings.isAdvBuyAutoComplete) return;

    let acceptButton;
    if (userSettings.advType === "recomendation") {
        acceptButton = document.querySelector('button[name="yt0"]')
    }

    acceptButton.scrollIntoView();
    acceptButton.click();
}

function getAdvInputs() {
    let startInput;
    let endInput;

    if (userSettings.advType === "recomendation") {
        startInput = document.querySelector('input[name="recom-start"]');
        endInput = document.querySelector('input[name="recom-end"]');
    }

    return {
        startInput,
        endInput
    }
}

function getFormattedDates() {
    const now = new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" });
    const currentDate = new Date(now);

    let startAdv = new Date(currentDate);
    startAdv.setDate(currentDate.getDate() + 1);

    let endAdv = new Date(currentDate);
    endAdv.setDate(currentDate.getDate() + userSettings.buyAdvDaysCount);

    function formatDate(date) {
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0'); // месяцы с 0
        let day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return {
        startAdv: formatDate(startAdv),
        endAdv: formatDate(endAdv)
    };
}

function setCopyableUserId() {
    // set copyable user ids in comments section
    if (!userSettings.isCopyableUserId) return;
    const commentElements = document.querySelectorAll(".comment-footer")
    commentElements.forEach(cmElement => {
        const aElement = cmElement.querySelector("a");
        const userId = aElement.getAttribute("href").split("/")[2];
        const userIdElement = createCopyableUserId(userId);
        aElement.insertAdjacentElement("afterend", userIdElement)
    })

}

function addCopyableBookId() {
    // Add a click-copyable text that contains book id
    if (!userSettings.isCopyableBookId) return;

    const currentUrl = window.location.href;
    const urlParts = currentUrl.split("/");
    const bookId = urlParts[urlParts.length - 1];

    const newElement = document.createElement('div');

    newElement.textContent = "(cкопировать айди)";
    newElement.style.display = 'inline-block';
    newElement.style.color = 'gray';
    newElement.style.fontSize = "14px"
    newElement.style.marginTop = "10px"

    newElement.style.position = 'relative'; // абсолютное позиционирование
    newElement.style.top = '50%'; // вертикальное центрирование
    newElement.style.left = '50%'; // горизонтальное центрирование
    newElement.style.transform = 'translate(-50%, -50%)'; // коррекция смещения для центрирования

    newElement.addEventListener('click', () => {
        navigator.clipboard.writeText(bookId)
            .then(() => {
                showTooltip('Текст скопирован!');
            })
            .catch(err => {
                console.error('Ошибка копирования: ', err);
            });
    });

    newElement.style.cursor = 'pointer';
    document.querySelector(".slick").appendChild(newElement)
}

function addButtonToEpubDownloader() {
    // Add button to download section that provide to telegram channel
    if (!userSettings.isRedirectToElibBot) return;
    const downloadButton = document.querySelector("input.btn.btn-info");
    if (downloadButton) {
        const newButton = downloadButton.cloneNode(true);

        newButton.value = "Скачать fb2/epub (tg)";
        newButton.style.marginLeft = "4px";
        newButton.removeAttribute("name");

        newButton.addEventListener("click", () => {
            window.open("https://t.me/ElibFB2_Books_b1_bot", "_blank");
        });

        downloadButton.insertAdjacentElement("afterend", newButton);
    } else {
        console.log("Исходная кнопка скачивания глав не найдена");
    }
}

function createCopyableUserId(userId) {
    // Add a click-copyable text on every user comments that contains user id
    const newElement = document.createElement('div');

    newElement.textContent = " (cкопировать айди)";
    newElement.style.display = 'inline-block';
    newElement.style.color = 'gray';

    newElement.addEventListener('click', () => {
        navigator.clipboard.writeText(userId)
            .then(() => {
                showTooltip('Текст скопирован!');
            })
            .catch(err => {
                console.error('Ошибка копирования: ', err);
            });
    });

    newElement.style.cursor = 'pointer';
    return newElement
}


function showTooltip(message) {
    // Create a 1 second tip at the top of the screen
    const tooltip = document.createElement('div');
    tooltip.innerText = message;
    tooltip.style.position = 'fixed';
    tooltip.style.top = '20px'; // Позиция сверху
    tooltip.style.left = '50%'; // Центрируем по горизонтали
    tooltip.style.transform = 'translateX(-50%)'; // Центрируем по горизонтали
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Полупрозрачный фон
    tooltip.style.color = 'white'; // Цвет текста
    tooltip.style.padding = '10px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.zIndex = '1000'; // Убедитесь, что подсказка поверх остальных элементов

    document.body.appendChild(tooltip);

    setTimeout(() => {
        document.body.removeChild(tooltip);
    }, 1000);
}


