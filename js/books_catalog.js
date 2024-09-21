// let userSettings;

loadSettings().then(() => {
    handleBooksPage();
});

async function loadSettings() {
    const result = await chrome.storage.local.get("settings");
    userSettings = result.settings || {}; // Сохраняем настройки в глобальную переменную
}


const currentUrl = window.location.href;
const userPageRegex = /https:\/\/tl\.rulate\.ru\/users/;
const catalogPageRegex = /https:\/\/tl\.rulate\.ru\/search\?.*$/;


function handleBooksPage() {
    const accountId = getcurrentAccountId();

    if (userPageRegex.test(currentUrl)) {
        const pageContent = document.querySelector(".for_table_container").querySelector("tbody");
        if (pageContent) {
            const bookElements = pageContent.querySelectorAll("tr");
            handleBooksData(bookElements, "user", accountId)
        }
    } else if (catalogPageRegex.test(currentUrl)) {
        const pageContent = document.querySelector(".search-results");
        if (pageContent) {
            const bookElements = pageContent.querySelectorAll("li");
            handleBooksData(bookElements, "catalog", accountId)
        }
    } else {
        console.log("Это не одна из ожидаемых страниц");
    }

}


function handleBooksData(bookElements, page, accountId) {
    bookElements.forEach(bookEl => {
        const emTags = bookEl.querySelectorAll("em");
        const styleForBookStatus = getBookStatus(emTags);
        const firstAElement = bookEl.querySelector("a");

        if (page === "user" && currentUrl.includes(accountId)) {
            setLinkToBookStatistic(bookEl, emTags);
            setButtonToBookSettings(bookEl);
        } else if (page === "user") {
            setCopyableBookId(bookEl);
        }
        setTimePassedAndButtonForTransferRequest(emTags, styleForBookStatus, firstAElement);

    });
}

function setButtonToBookSettings(bookEl) {
    const firstTdElement = bookEl.querySelector("td");

    const firstAElement = bookEl.querySelector("a")
    const linkToBookSettings = firstAElement.getAttribute("href") + "/edit/info"

    const button = document.createElement('button');
    button.style.width = '16px';
    button.style.height = '16px';
    button.style.padding = '0';
    button.style.border = 'none';
    button.style.background = 'none';
    // button.style.margin = "0px";
    button.style.cursor = 'pointer';
    button.title = "Перейти в настройки книги"
    
    // Создаем SVG
    const svgNS = "http://www.w3.org/2000/svg"; // Пространство имен SVG
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "16px");
    svg.setAttribute("height", "16px");
    svg.setAttribute("viewBox", "0 -960 960 960");
    svg.setAttribute("fill", "#000");

    // Создаем путь внутри SVG
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "m405.38-120-14.46-115.69q-19.15-5.77-41.42-18.16-22.27-12.38-37.88-26.53L204.92-235l-74.61-130 92.23-69.54q-1.77-10.84-2.92-22.34-1.16-11.5-1.16-22.35 0-10.08 1.16-21.19 1.15-11.12 2.92-25.04L130.31-595l74.61-128.46 105.93 44.61q17.92-14.92 38.77-26.92 20.84-12 40.53-18.54L405.38-840h149.24l14.46 116.46q23 8.08 40.65 18.54 17.65 10.46 36.35 26.15l109-44.61L829.69-595l-95.31 71.85q3.31 12.38 3.7 22.73.38 10.34.38 20.42 0 9.31-.77 19.65-.77 10.35-3.54 25.04L827.92-365l-74.61 130-107.23-46.15q-18.7 15.69-37.62 26.92-18.92 11.23-39.38 17.77L554.62-120H405.38ZM440-160h78.23L533-268.31q30.23-8 54.42-21.96 24.2-13.96 49.27-38.27L736.46-286l39.77-68-87.54-65.77q5-17.08 6.62-31.42 1.61-14.35 1.61-28.81 0-15.23-1.61-28.81-1.62-13.57-6.62-29.88L777.77-606 738-674l-102.08 42.77q-18.15-19.92-47.73-37.35-29.57-17.42-55.96-23.11L520-800h-79.77l-12.46 107.54q-30.23 6.46-55.58 20.81-25.34 14.34-50.42 39.42L222-674l-39.77 68L269-541.23q-5 13.46-7 29.23t-2 32.77q0 15.23 2 30.23t6.23 29.23l-86 65.77L222-286l99-42q23.54 23.77 48.88 38.12 25.35 14.34 57.12 22.34L440-160Zm38.92-220q41.85 0 70.93-29.08 29.07-29.07 29.07-70.92t-29.07-70.92Q520.77-580 478.92-580q-42.07 0-71.04 29.08-28.96 29.07-28.96 70.92t28.96 70.92Q436.85-380 478.92-380ZM480-480Z");

    // Вставляем путь в SVG
    svg.appendChild(path);

    // Вставляем SVG в кнопку
    button.appendChild(svg);
    firstTdElement.appendChild(button);

    // add listener so on click will be open a book settings
    button.addEventListener("click", () => {
        window.open(linkToBookSettings)
    });
}

function setCopyableBookId(bookElement) {
    // Add a click-copyable text that contains book id
    if (!userSettings.isCopyableBookId) return;

    const aElement = bookElement.querySelector("a");
    if (aElement) {
        const bookId = aElement.getAttribute("href").split("/")[2];
        const newElement = document.createElement('div');

        newElement.textContent = " (айди)";
        newElement.style.display = 'inline-block';
        newElement.style.color = 'gray';
        newElement.style.cursor = 'pointer';

        newElement.style.position = 'relative'; // абсолютное позиционирование
        newElement.style.top = '50%'; // вертикальное центрирование
        newElement.style.left = '50%'; // горизонтальное центрирование
        newElement.style.transform = 'translate(-50%, -50%)'; // коррекция смещения для центрирования
        newElement.style.marginTop = "8px";


        newElement.addEventListener('click', () => {
            navigator.clipboard.writeText(bookId)
                .then(() => {
                    showTooltip('Текст скопирован!');
                })
                .catch(err => {
                    console.error('Ошибка копирования: ', err);
                });
        });

        bookElement.querySelector(".th").insertAdjacentElement("afterend", newElement)

    }

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

function setTimePassedAndButtonForTransferRequest(emTags, styleForBookStatus, linkToBookElement) {
    // Add the number of days since the last activity for every book on user page,
    // also, with some logic, adds text styles to make notices more visible
    if (!userSettings.isLastActivity) return;

    emTags.forEach(em => {
        elementText = em.textContent

        if (elementText.startsWith("последняя активность")) {
            const dateString = elementText.split(": ")[1];
            const dateParts = dateString.split(' ');
            if (dateParts.length === 1 && dateParts[0] === '') {
                return;
            }
            const daysPassed = getDaysPassed(dateParts);
            const badge = document.createElement("em");
            if (daysPassed > 30 && styleForBookStatus === "green") {
                badge.style.color = styleForBookStatus;
                badge.style.fontWeight = "bold";
            }

            badge.textContent = ` (Прошло ${daysPassed} дней)`;
            em.insertAdjacentElement("afterend", badge);

            const linkToBook = linkToBookElement.getAttribute("href")
            const btn = createButtonToAdminDM(linkToBook);
            badge.insertAdjacentElement("afterend", btn);

        }
    });
}

function createButtonToAdminDM(linkToBook) {
    // create button that allow to open new window DM with admin, where have already inserted text
    // for request book  
    const btn = document.createElement("button");
    btn.textContent = "Написать админу";

    btn.style.backgroundColor = "rgba(0, 0, 0, 0)"; // Полупрозрачный синий фон
    btn.style.color = "black"; // Белый текст
    btn.style.border = "none"; // Без рамки
    btn.style.padding = "1px 3px"; // Внутренний отступ
    btn.style.fontSize = "11px"; // Размер шрифта
    btn.style.fontStyle = "italic";
    btn.style.borderRadius = "5px"; // Закруглённые углы
    btn.style.cursor = "pointer"; // Указатель при наведении
    btn.style.opacity = "0.8"; // Полупрозрачность
    btn.style.transition = "opacity 0.3s"; // Плавное изменение прозрачности при наведении

    btn.addEventListener("click", () => {
        const adminDM = "https://tl.rulate.ru/messages/chat/8?Mail_page=999"
        chrome.storage.local.set({ requestBookLink: "https://tl.rulate.ru" + linkToBook })
        window.open(adminDM)
    });

    return btn;

}

function getDaysPassed(dateParts) {
    // Returns a string which contains integer that mean how many days passed from spicific Date
    const [day, month, year] = dateParts[0].split('.');
    const [hours, minutes] = dateParts[1].split(':');
    const dateObject = new Date(Number(year), Number(month) - 1, Number(day), Number(hours),
        Number(minutes));
    const currentDate = new Date();
    const timeDifference = currentDate - dateObject;
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    if (daysPassed === -1) {
        return 0;
    }
    return daysPassed;
}


function getBookStatus(emTags) {
    // Returns a string with color type for text based on translation status book 
    for (em of emTags) {
        if (em.textContent.startsWith("состояние перевода:")) {
            statusBook = em.textContent.split(": ")[1]
            if (statusBook === "В работе") {
                return "green";
            } else {
                return "black";
            };
        };
    };
};

function setLinkToBookSettings(tdElement) {
    // Add link to the book settings from user page
    if (!userSettings.isOpenSettings) return;

    const aElement = tdElement.querySelector("a")
    if (aElement !== null) {
        const linkToBook = aElement.getAttribute("href");
        const aNewElementForSettings = document.createElement("a");
        aNewElementForSettings.href = linkToBook + "/edit";
        aNewElementForSettings.title = "Перейти в настройки книги";
        aNewElementForSettings.textContent = "(настройки)";
        aNewElementForSettings.target = "_blank";
        tdElement.querySelector(".meta").insertAdjacentElement("beforebegin", aNewElementForSettings);
    }
}

function setLinkToBookStatistic(tdElement, emTags) {
    // Add link to Statistic for thats book where you dont have the same link
    // In case you have access to this page but book is not yours
    if (!userSettings.isOpenStatistics) return;

    const aElements = tdElement.querySelectorAll("a")
    for (el of aElements) {
        if (el.textContent === "Статистика") {
            return;
        }
    }
    const aElement = tdElement.querySelector("a")
    const lastEm = emTags[emTags.length - 1];
    if (aElement !== null) {
        const linkToBook = aElement.getAttribute("href");
        const aNewElementForStatistic = document.createElement("a");
        aNewElementForStatistic.href = linkToBook + "/stat";
        aNewElementForStatistic.title = "Перейти в cтатистику книги";
        aNewElementForStatistic.textContent = "Статистика";
        aNewElementForStatistic.style.fontStyle = "italic";
        aNewElementForStatistic.style.marginLeft = "4px";
        aNewElementForStatistic.target = "_blank";
        lastEm.insertAdjacentElement("afterend", aNewElementForStatistic)
    }
};