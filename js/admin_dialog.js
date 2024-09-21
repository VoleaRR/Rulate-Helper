addTransferRequestToChat();

async function addTransferRequestToChat() {
    // Inserts a Transfer Request to Admin by getting link from the storage
    const askTransferSample = "Привет, можешь передать книгу?\n"

    chrome.storage.local.get("requestBookLink").then(result => {
        const desiredBookLink = result.requestBookLink;
        if (desiredBookLink) {
            const chatBox = document.getElementById("Mail_body")
            chatBox.value = askTransferSample + desiredBookLink;
        }

        return chrome.storage.local.remove("requestBookLink");
    }).then(() => {
        console.log("Значение успешно удалено из хранилища.");
    }).catch(error => {
        console.error("Ошибка при получении или удалении значения из хранилища:", error);
    });

}