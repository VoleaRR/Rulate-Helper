
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

    return {
        isOpenSettings, isLastActivity, isOpenStatistics, isCopyableUserId, isCopyableBookId,
        isRedirectToElibBot, isRedirectToYandexSearch, isBalanceTracking,
        isShowThanksCount, isReferralsSummary
    }
}

function getSettingValuesFromDOM() {
    const elements = getSettingElementsFromDOM();
    const newSettings = {};

    // Пройти по всем элементам и собрать их значения
    for (const key in elements) {
        if (elements.hasOwnProperty(key)) {
            const element = elements[key];
            newSettings[key] = element.checked; // Предполагается, что все элементы являются чекбоксами
        }
    }

    return newSettings; // Возвращаем объект с новыми настройками
}

function setSettingsValuesToDom(settings) {
    const elements = getSettingElementsFromDOM();
    console.log(settings);

    // Пройти по всем элементам и установить их значения
    for (const key in elements) {
        if (elements.hasOwnProperty(key)) {
            const element = elements[key];
            if (settings.hasOwnProperty(key)) {
                element.checked = settings[key]; // Устанавливаем значение чекбокса
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

