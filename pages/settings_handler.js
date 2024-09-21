
let settings;

chrome.storage.local.get('settings', (result) => {
    settings = result.settings || {};
    setSettingsValuesToDom(settings);
});


addInfoMediaViewer();
addExtensionVersion();



document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('save-settings');
    saveButton.addEventListener('click', () => {
        const newSettings = getSettingValuesFromDOM();
        updateSettings(settings, newSettings)

        chrome.storage.local.set({settings});

        const confirmationImage = document.getElementById('save-confirmation');
        confirmationImage.style.opacity = '1';
        setTimeout(function () {
            confirmationImage.style.opacity = '0';
        }, 2000);
    });
});

const updateSettings = (settings, newSettings) => {
    for (const key in newSettings) {
        if (newSettings.hasOwnProperty(key)) {
            // Если ключа нет в settings или значения не совпадают
            if (!settings.hasOwnProperty(key) || settings[key] !== newSettings[key]) {
                settings[key] = newSettings[key];  // Обновляем или добавляем значение
            }
        }
    }
    return settings;  // Возвращаем обновлённый settings
};

function getSettingElementsFromDOM() {
    // claim all settings values from html elements and return an object
    const isOpenSettings = document.getElementById('open-settings');
    const isLastActivity = document.getElementById('last-activity');
    const isOpenStatistics = document.getElementById('open-statistics');
    const isCopyableUserId = document.getElementById('copyable-user-id');
    const isCopyableBookId = document.getElementById('copyable-book-id');
    const isRedirectToElibBot = document.getElementById('redirect-to-elib-tg');
    const isRedirectToYandexSearch = document.getElementById('redirect-to-yandex-search');
    const isBalanceTracking = document.getElementById('balance-tracking');
    const isShowThanksCount = document.getElementById('thanks-count');
    const isReferralsSummary = document.getElementById('referrals-summary');
    const isFastBuyAdv = document.getElementById('fast-buy-adv');
    const advType = document.getElementById('adv-type');
    const buyAdvDaysCount = document.getElementById('buy-adv-days-count');
    const isAdvBuyAutoComplete = document.getElementById('fast-buy-auto-complete');

    return {
        isOpenSettings, isLastActivity, isOpenStatistics, isCopyableUserId, isCopyableBookId,
        isRedirectToElibBot, isRedirectToYandexSearch, isBalanceTracking,
        isShowThanksCount, isReferralsSummary, isFastBuyAdv, advType, buyAdvDaysCount, isAdvBuyAutoComplete
    }
}

function getSettingValuesFromDOM() {
    const elements = getSettingElementsFromDOM();
    const newSettings = {};

    // Пройти по всем элементам и собрать их значения
    for (const key in elements) {
        if (elements.hasOwnProperty(key)) {
            const element = elements[key];
            // Если элемент является checkbox
            if (element.type === 'checkbox') {
                newSettings[key] = element.checked;
            } 
            // Если элемент является select
            else if (element.type === 'select-one') {
                newSettings[key] = element.value;
            }
            // Если элемент является number типом
            else if (element.type === 'number') {
                newSettings[key] = (element.value !== "") ? parseInt(element.value) : 0;
            }
            // Можно добавить обработку других типов, если появятся
        }
    }

    return newSettings; // Возвращаем объект с новыми настройками
}

function setSettingsValuesToDom(settings) {
    const elements = getSettingElementsFromDOM();

    // Пройти по всем элементам и установить их значения
    for (const key in elements) {
        if (elements.hasOwnProperty(key)) {
            const element = elements[key];
            if (settings.hasOwnProperty(key)) {
                // Если элемент является checkbox
                if (element.type === 'checkbox') {
                    element.checked = settings[key];
                }
                // Если элемент является select
                else if (element.tagName === 'SELECT') {
                    element.value = settings[key];
                }
                // Если элемент является number типом
                else if (element.type === 'number') {
                    element.value = settings[key];
                }
                // Можно добавить обработку других типов, если появятся
            }
        }
    }
}


function addExtensionVersion() {
    const version = chrome.runtime.getManifest().version;
    const versionElement = document.querySelector(".extension-version");
    versionElement.textContent = `v${version}`;
}

function addInfoMediaViewer() {
    // Получаем кнопки и модальное окно
    console.log("start")
    const infoButtons = document.querySelectorAll('.info-button');
    const modal = document.getElementById('video-modal');
    const modalVideo = document.getElementById('video-element');

    // Добавляем обработчики событий на кнопки
    infoButtons.forEach(button => {
        button.addEventListener('click', function () {
            const videoSrc = this.getAttribute('data-video-src');
            modalVideo.src = videoSrc;
            modal.style.display = 'flex'; // Показываем модальное окно
            modalVideo.play(); // Запускаем видео при открытии
        });
    });

    // Закрытие модального окна при клике на фон
    modal.addEventListener('click', function () {
        modal.style.display = 'none'; // Скрываем модальное окно
        modalVideo.pause(); // Останавливаем видео
        modalVideo.src = ''; // Очищаем источник видео
    });
}

