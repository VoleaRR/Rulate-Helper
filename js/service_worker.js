chrome.runtime.onInstalled.addListener(function (details) {
    const defaultSettings = {
        isOpenSettings: true,
        isLastActivity: true,
        isOpenStatistics: true,
        isCopyableUserId: false,
        isCopyableBookId: false,
        isRedirectToElibBot: true,
        isRedirectToYandexSearch: true,
        isBalanceTracking: true,
        isShowThanksCount: false,
        isReferralsSummary: true
    };

    chrome.storage.local.get('settings', (result) => {
        const currentSettings = result.settings || {};  // Получаем текущие настройки или пустой объект

        // Обновляем текущие настройки, добавляя новые параметры из defaultSettings
        for (const key in defaultSettings) {
            if (defaultSettings.hasOwnProperty(key)) {
                // Если параметр отсутствует в текущих настройках, добавляем его
                if (!currentSettings.hasOwnProperty(key)) {
                    currentSettings[key] = defaultSettings[key];
                }
            }
        }

        chrome.storage.local.set({ settings: currentSettings }, () => {
            console.log('Settings have been initialized/updated:', currentSettings);
        });
    });
});



chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/settings.html') });
});
