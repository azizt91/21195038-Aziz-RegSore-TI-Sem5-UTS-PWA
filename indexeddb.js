const dbVersion = 1;
const dbName = "KomentarDB";
let db;

const request = indexedDB.open(dbName, dbVersion);

request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("komentar")) {
        const objectStore = db.createObjectStore("komentar", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("timestamp", "timestamp", { unique: false });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadCommentsFromDB();
};


const form = document.getElementById("komentar-form");
const komentarInput = document.getElementById('komentar');
const daftarKomentar = document.getElementById("daftar-komentar");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = document.getElementById("nama").value;
    const komentarText = document.getElementById("komentar").value;
    const timestamp = new Date().toISOString();

    const komentar = { nama, komentar: komentarText, timestamp };

    saveCommentToDB(komentar);
});

function saveCommentToDB(comment) {
    const transaction = db.transaction(["komentar"], "readwrite");
    const objectStore = transaction.objectStore("komentar");
    const request = objectStore.add(comment);

    request.onsuccess = () => {
        loadCommentsFromDB();
        document.getElementById("nama").value = "";
        document.getElementById("komentar").value = "";
    };

    request.onerror = (event) => {
        console.error("Error saving comment: " + event.target.error);
    };
}

function loadCommentsFromDB() {
    while (daftarKomentar.firstChild) {
        daftarKomentar.removeChild(daftarKomentar.firstChild);
    }

    const transaction = db.transaction(["komentar"], "readonly");
    const objectStore = transaction.objectStore("komentar");
    const index = objectStore.index("timestamp");

    index.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const komentar = cursor.value;

            const commentDiv = document.createElement("div");
            commentDiv.className = "comment";
            commentDiv.innerHTML = `
                <p>${komentar.nama}</p>
                <p>${komentar.komentar}</p>
                <p><small>${komentar.timestamp}<small></p>
                <button class="edit-button" data-id="${cursor.primaryKey}">Edit</button>
                <button class="delete-button" data-id="${cursor.primaryKey}">Delete</button>
            `;
            daftarKomentar.appendChild(commentDiv);

            // Add event listeners for edit and delete buttons
            const editButton = commentDiv.querySelector(".edit-button");
            const deleteButton = commentDiv.querySelector(".delete-button");

            editButton.addEventListener("click", () => editComment(cursor.primaryKey));
            deleteButton.addEventListener("click", () => deleteComment(cursor.primaryKey));

            cursor.continue();
        }
    };
}

function editComment(commentId) {
    const transaction = db.transaction(["komentar"], "readwrite");
    const objectStore = transaction.objectStore("komentar");
    const request = objectStore.get(commentId);

    request.onsuccess = (event) => {
        const komentar = event.target.result;

        // Remove the existing comment
        const commentDiv = document.querySelector(`[data-id="${commentId}"]`);
        commentDiv.innerHTML = "";

        // Create an input field for editing
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = komentar.komentar;

        // Create a "Save" button
        const saveButton = document.createElement("button");
        saveButton.textContent = "Simpan";

        // Add event listener for the "Save" button
        saveButton.addEventListener("click", () => saveEditedComment(commentId, editInput.value));

        commentDiv.appendChild(editInput);
        commentDiv.appendChild(saveButton);
    };
}

function saveEditedComment(commentId, editedComment) {
    const transaction = db.transaction(["komentar"], "readwrite");
    const objectStore = transaction.objectStore("komentar");
    const request = objectStore.get(commentId);

    request.onsuccess = (event) => {
        const komentar = event.target.result;

        // Update the comment text
        komentar.komentar = editedComment;

        // Put the updated comment back into IndexedDB
        const updateRequest = objectStore.put(komentar);

        updateRequest.onsuccess = () => {
            // Reload the comments after editing
            loadCommentsFromDB();
        };

        updateRequest.onerror = (event) => {
            console.error("Error updating comment: " + event.target.error);
        };
    };
}


function deleteComment(commentId) {
    const transaction = db.transaction(["komentar"], "readwrite");
    const objectStore = transaction.objectStore("komentar");
    objectStore.delete(commentId);

    transaction.oncomplete = () => loadCommentsFromDB();
}


