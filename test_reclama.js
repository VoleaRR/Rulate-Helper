// document.getElementById('advert_site-tab').click();
// let dates = getFormattedDates();
// let element_st = document.querySelector('input[name="recom-start"]');
// let element_end = document.querySelector('input[name="recom-end"]');
// element_st.value = dates.tomorrow
// element_end.value = dates.sevenDaysLater

// console.log(userSettings)

// let btn = documisent.querySelector('button[name="yt0"]')
// console.log(btn)
// btn.scrollIntoView();
// btn.click();


function getFormattedDates() {
    let now = new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" });
    let currentDate = new Date(now);

    let tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);

    let sevenDaysLater = new Date(currentDate);
    sevenDaysLater.setDate(currentDate.getDate() + 2);

    function formatDate(date) {
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0'); // месяцы с 0
        let day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return {
        tomorrow: formatDate(tomorrow),
        sevenDaysLater: formatDate(sevenDaysLater)
    };
}