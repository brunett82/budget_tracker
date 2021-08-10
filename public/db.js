const pend = `pending`;
const request = indexedDB.open(`budget`, 2);

request.onupgradeneeded = event => {
    const db = request.result;
    if (!db.objectStoreNames.contains(pend)) {
        db.createObjectStore(pend, { autoIncrement: true });
    }
};

request.onsuccess = event => {
    console.log(`Success! ${event.type}`);
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = event => console.error(event);

function checkDatabase() {
    const db = request.result;
    let transaction = db.transaction([pend], `readwrite`);
    let store = transaction.objectStore(pend);
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch(`/api/transaction/bulk`, {
                method: `POST`,
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: `application/json, text/plain, */*`,
                    "Content-Type": `application/json`
                }
            })
                .then(response => response.json())
                .then(() => {
                    transaction = db.transaction([pend], `readwrite`);
                    store = transaction.objectStore(pend);
                    store.clear();
                });
        }
    };
}
function saveRecord(record) {
    const db = request.result;
    const transaction = db.transaction([pend], `readwrite`);
    const store = transaction.objectStore(pend);
    store.add(record);
}
window.addEventListener(`online`, checkDatabase);