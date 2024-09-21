// let userSettings;

loadSettings().then(() => {
    handleMainBookPage();
});

async function loadSettings() {
    const result = await chrome.storage.local.get("settings");
    userSettings = result.settings || {}; // Сохраняем настройки в глобальную переменную
}

function handleMainBookPage() {
    if (!userSettings.isShowThanksCount) return;

    if (bookPageRegex.test(currentUrl)) {
        const partialUrls = getChapterUrls();

        partialUrls?.length ?
            fetchLikes(partialUrls).then(likesData => {
                const indexThElement = addThumbsUpClass();
                setLikesOnPage(likesData, indexThElement);
            }).catch(error => console.error("Ошибка при получении лайков:", error))
            : console.log("Кажется, на странице нет глав");

    }
}


function setLikesOnPage(likesData, indexThElement) {
    const chaptersTable = document.querySelector("#Chapters");
    const trElements = chaptersTable.querySelectorAll("tr");
    trElements.forEach(rowElement => {
        const anchor = rowElement.querySelector(".t a");
        if (!anchor) return;

        const href = anchor.getAttribute("href");
        const likes = likesData[href];
        const tdLikesElement = document.createElement("td");
        tdLikesElement.textContent = likes;

        const tdElements = rowElement.querySelectorAll("td")
        const insertIndex = Math.min(indexThElement, tdElements.length);

        if (insertIndex === tdElements.length) {
            rowElement.appendChild(tdLikesElement);
        } else {
            rowElement.insertBefore(tdLikesElement, tdElements[insertIndex]);
        }

    })

}

function addThumbsUpClass() {
    const thumbsUpElement = document.createElement('th');
    thumbsUpElement.setAttribute('title', 'Спасибо');
    const iconElement = document.createElement('i');
    iconElement.classList.add('icon-thumbs-up');
    thumbsUpElement.appendChild(iconElement)

    const tableThElements = document.querySelectorAll("thead th")
    const lastTableTh = tableThElements[tableThElements.length - 1]
    const thTitle = lastTableTh.getAttribute("title")
    if (thTitle.startsWith("Click")) {
        lastTableTh.insertAdjacentElement("beforebegin", thumbsUpElement)
        return tableThElements.length
    } else {
        lastTableTh.insertAdjacentElement("afterend", thumbsUpElement)
        return tableThElements.length + 1
    }

}

async function fetchLikes(partialUrls) {
    const prefix = "https://tl.rulate.ru";
    const suffix = "/thanks_count";

    const fetchLikeForUrl = async (partialUrl) => {
        try {
            const correctPartialUrl = getCorrectUrl(partialUrl);
            // console.log(`correct link is ${prefix}${correctPartialUrl}${suffix}`)
            const response = await fetch(`${prefix}${correctPartialUrl}${suffix}`);
            const data = await response.json();
            return { [partialUrl]: data.likes };
        } catch (error) {
            console.error(`Ошибка при загрузке данных для ${prefix}${partialUrl}:`, error);
            return { [partialUrl]: "hz" };
        }
    };

    const results = await Promise.all(partialUrls.map(fetchLikeForUrl));

    return results.reduce((acc, result) => {
        const [key, value] = Object.entries(result)[0];
        acc[key] = value;
        return acc;
    }, {});

}

function getChapterUrls() {
    const chaptersTable = document.querySelector("#Chapters");
    if (chaptersTable.querySelector(".icon-thumbs-up")) {
        console.log("In table there is thumbs up, skip");
        return;
    }
    const chapterUrls = [];

    const aElements = chaptersTable.querySelectorAll(".t a");
    aElements.forEach(element => {
        chapterUrls.push(element.getAttribute("href"))
    })
    return chapterUrls;
}


function getCorrectUrl(url) {
    // receive "/book/118661/4734388/ready_new" or "/book/118661/4734388" and if 1 option, then remove
    // ready new and return "/book/118661/4734388" in both cases.
    if (url.endsWith("/ready_new")) {
        return url.slice(0, -"/ready_new".length);
    }
    return url
}

