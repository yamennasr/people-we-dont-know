const birthdays = [
    { name: "Sultan", month: 0, day: 25 },
    { name: "Alma", month: 1, day: 19 },
    { name: "Kenny", month: 1, day: 23 },
    { name: "Daniel", month: 2, day: 9 },
    { name: "Eddy", month: 2, day: 17 },
    { name: "Lilly", month: 3, day: 10 },
    { name: "Yamen", month: 4, day: 7 },
    { name: "Naveed", month: 4, day: 25 },
    { name: "Kimo", month: 6, day: 7 },
    { name: "Salam", month: 6, day: 7 },
    { name: "Roy", month: 7, day: 17 },
    { name: "Serena", month: 10, day: 9 },
    { name: "Remi", month: 11, day: 1 },
    { name: "Bissan", month: 11, day: 4 },
];

const count = document.querySelector("#birthday-count");
const nextName = document.querySelector("#next-birthday-name");
const nextCountdown = document.querySelector("#next-birthday-countdown");
const monthTitle = document.querySelector("#calendar-month");
const calendarDays = document.querySelector("#calendar-days");
const monthBirthdayList = document.querySelector("#month-birthday-list");
const previousMonthButton = document.querySelector("#previous-month");
const nextMonthButton = document.querySelector("#next-month");
const thisMonthButton = document.querySelector("#this-month");
const today = new Date();
today.setHours(0, 0, 0, 0);

const upcomingBirthdays = birthdays
    .map((birthday) => {
        let nextDate = new Date(today.getFullYear(), birthday.month, birthday.day);
        nextDate.setHours(0, 0, 0, 0);

        if (nextDate < today) {
            nextDate = new Date(today.getFullYear() + 1, birthday.month, birthday.day);
        }

        const daysUntil = Math.round((nextDate - today) / 86_400_000);
        return { ...birthday, nextDate, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil || a.name.localeCompare(b.name));

count.textContent = `${upcomingBirthdays.length} friends`;

const nextBirthdays = upcomingBirthdays.filter(
    (birthday) => birthday.daysUntil === upcomingBirthdays[0].daysUntil,
);
const countdownText = (days) => days === 0
    ? "Today!"
    : days === 1
        ? "Tomorrow"
        : `In ${days} days`;

nextName.textContent = nextBirthdays.map((birthday) => birthday.name).join(" & ");
nextCountdown.textContent = countdownText(nextBirthdays[0].daysUntil);

let displayedMonth = new Date(
    upcomingBirthdays[0].nextDate.getFullYear(),
    upcomingBirthdays[0].month,
    1,
);

const monthFormatter = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
});
const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
});

function getDaysUntil(date) {
    const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    while (nextDate < today) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
    return Math.round((nextDate - today) / 86_400_000);
}

function formatLocalDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function renderCalendar() {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    monthTitle.textContent = monthFormatter.format(displayedMonth);

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const firstVisibleDate = new Date(year, month, 1);
    firstVisibleDate.setDate(firstVisibleDate.getDate() - firstVisibleDate.getDay());
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekCount = Math.ceil((firstDayOfWeek + daysInMonth) / 7);
    const rows = [];
    const thisMonthBirthdays = [];

    for (let week = 0; week < weekCount; week += 1) {
        const row = document.createElement("tr");

        for (let weekday = 0; weekday < 7; weekday += 1) {
            const date = new Date(firstVisibleDate);
            date.setDate(firstVisibleDate.getDate() + week * 7 + weekday);
            const cell = document.createElement("td");
            const events = birthdays.filter(
                (birthday) => birthday.month === date.getMonth() && birthday.day === date.getDate(),
            );
            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.getFullYear() === today.getFullYear()
                && date.getMonth() === today.getMonth()
                && date.getDate() === today.getDate();
            const dayClasses = ["calendar-day"];

            if (!isCurrentMonth) dayClasses.push("outside-month");
            if (isToday) dayClasses.push("today");
            if (events.length) dayClasses.push("has-birthday");
            if (events.some((event) => nextBirthdays.some((next) =>
                next.name === event.name
                && next.nextDate.getFullYear() === date.getFullYear()
                && next.nextDate.getMonth() === date.getMonth()
                && next.nextDate.getDate() === date.getDate(),
            ))) {
                dayClasses.push("next-birthday-day");
            }

            const dayContent = document.createElement("div");
            dayContent.className = dayClasses.join(" ");
            dayContent.setAttribute("role", "group");
            dayContent.setAttribute(
                "aria-label",
                `${dateFormatter.format(date)}${events.length ? `, birthdays: ${events.map((event) => event.name).join(", ")}` : ""}`,
            );

            const dayNumber = document.createElement("time");
            dayNumber.className = "day-number";
            dayNumber.dateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            dayNumber.textContent = date.getDate();
            dayContent.append(dayNumber);

            if (events.length) {
                const markers = document.createElement("span");
                markers.className = "birthday-markers";
                markers.setAttribute("aria-hidden", "true");
                for (const _event of events) {
                    markers.append(document.createElement("span"));
                }
                dayContent.append(markers);
            }

            cell.append(dayContent);
            row.append(cell);

            if (isCurrentMonth) {
                for (const birthday of events) {
                    const eventDate = new Date(year, month, birthday.day);
                    const daysUntil = getDaysUntil(eventDate);
                    thisMonthBirthdays.push({ ...birthday, eventDate, daysUntil });
                }
            }
        }

        rows.push(row);
    }

    calendarDays.replaceChildren(...rows);
    monthBirthdayList.replaceChildren();

    thisMonthBirthdays.sort((a, b) => a.day - b.day || a.name.localeCompare(b.name));
    if (!thisMonthBirthdays.length) {
        const emptyState = document.createElement("li");
        emptyState.className = "no-birthdays";
        emptyState.textContent = "No birthdays this month — check back next month!";
        monthBirthdayList.append(emptyState);
        return;
    }

    for (const birthday of thisMonthBirthdays) {
        const item = document.createElement("li");
        const isNextBirthday = nextBirthdays.some((next) => next.name === birthday.name);
        item.className = `month-birthday${isNextBirthday ? " is-next-birthday" : ""}`;

        const eventDate = document.createElement("time");
        eventDate.className = "month-birthday-date";
        eventDate.dateTime = formatLocalDate(birthday.eventDate);
        eventDate.textContent = new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
        }).format(birthday.eventDate);

        const name = document.createElement("span");
        name.className = "month-birthday-name";
        name.textContent = birthday.name;

        const countdown = document.createElement("span");
        countdown.className = "month-birthday-countdown";
        countdown.textContent = countdownText(birthday.daysUntil);

        item.append(eventDate, name, countdown);
        monthBirthdayList.append(item);
    }
}

previousMonthButton.addEventListener("click", () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    renderCalendar();
});
nextMonthButton.addEventListener("click", () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    renderCalendar();
});
thisMonthButton.addEventListener("click", () => {
    displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCalendar();
});

renderCalendar();

const currentTime = document.querySelector("#current-time");
const currentDate = document.querySelector("#current-date");
const weatherStatus = document.querySelector("#weather-status");
const localTimeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
});
const localDateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
});

function updateLocalDateTime() {
    const now = new Date();
    currentTime.dateTime = now.toISOString();
    currentTime.textContent = localTimeFormatter.format(now);
    currentDate.dateTime = formatLocalDate(now);
    currentDate.textContent = localDateFormatter.format(now);
}

updateLocalDateTime();
window.setInterval(updateLocalDateTime, 30_000);

let weatherCoordinates;
const weatherDescriptions = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Icy fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers",
    81: "Rain showers",
    82: "Heavy showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Heavy thunderstorm with hail",
};

async function updateWeather() {
    try {
        if (!weatherCoordinates) {
            const geocodingResponse = await fetch(
                "https://geocoding-api.open-meteo.com/v1/search?name=Mount%20Lebanon&count=10&language=en&format=json",
            );
            if (!geocodingResponse.ok) {
                throw new Error(`Location lookup failed (${geocodingResponse.status}).`);
            }

            const geocodingData = await geocodingResponse.json();
            const location = geocodingData.results?.find((result) => result.country_code === "LB");
            if (!location) {
                throw new Error("Mount Lebanon was not found by the weather service.");
            }
            weatherCoordinates = { latitude: location.latitude, longitude: location.longitude };
        }

        const parameters = new URLSearchParams({
            latitude: weatherCoordinates.latitude,
            longitude: weatherCoordinates.longitude,
            current: "temperature_2m,weather_code",
            temperature_unit: "celsius",
            timezone: "auto",
        });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${parameters}`);
        if (!response.ok) {
            throw new Error(`Weather request failed (${response.status}).`);
        }

        const data = await response.json();
        const current = data.current;
        if (!Number.isFinite(current?.temperature_2m) || !Number.isFinite(current?.weather_code)) {
            throw new Error("Weather service returned incomplete current conditions.");
        }

        const description = weatherDescriptions[current.weather_code] ?? "Current conditions";
        weatherStatus.textContent = `${description} · ${Math.round(current.temperature_2m)}°C`;
    } catch (error) {
        weatherStatus.textContent = "Weather unavailable";
        console.error("Could not load weather for Mount Lebanon.", error);
    }
}

updateWeather();
window.setInterval(updateWeather, 15 * 60 * 1000);

const photoCollage = document.querySelector("#photo-collage");
const addPhotosButton = document.querySelector("#add-photos-button");
const photoUpload = document.querySelector("#photo-upload");
const photoUploadStatus = document.querySelector("#photo-upload-status");
const photoViewer = document.querySelector("#photo-viewer");
const viewerImage = document.querySelector("#viewer-image");
const viewerCaption = document.querySelector("#viewer-caption");
const viewerPosition = document.querySelector("#viewer-position");
const closeViewerButton = document.querySelector("#close-viewer");
const previousPhotoButton = document.querySelector("#previous-photo");
const nextPhotoButton = document.querySelector("#next-photo");
const storageConfig = window.PHOTO_STORAGE_CONFIG ?? {};
const storageBaseUrl = typeof storageConfig.supabaseUrl === "string"
    ? storageConfig.supabaseUrl.replace(/\/+$/, "")
    : "";
const storageBucket = typeof storageConfig.bucket === "string" ? storageConfig.bucket : "";
const storageKey = typeof storageConfig.anonKey === "string" ? storageConfig.anonKey : "";
const storageConfigured = Boolean(storageBaseUrl && storageBucket && storageKey);
const maximumPhotoSize = 10 * 1024 * 1024;
const originalPhotos = [...photoCollage.querySelectorAll(".photo-slot-image")].map((image) => ({
    url: image.currentSrc || image.src,
    alt: image.alt,
}));
let photoCatalog = originalPhotos;
let currentPhotoIndex = 0;

function renderPhotoCollage() {
    const positionClasses = [
        "photo-slot-tall",
        "photo-slot-two",
        "photo-slot-three",
        "photo-slot-four",
        "photo-slot-five",
        "photo-slot-six",
        "photo-slot-seven",
    ];
    const figures = photoCatalog.slice(0, 7).map((photo, index) => {
        const figure = document.createElement("figure");
        figure.className = `photo-slot ${positionClasses[index]}`;
        figure.dataset.photoIndex = String(index);

        const image = document.createElement("img");
        image.className = "photo-slot-image";
        image.src = photo.url;
        image.alt = photo.alt;

        figure.append(image);
        return figure;
    });

    photoCollage.replaceChildren(...figures);
}

function getStorageHeaders(additionalHeaders = {}) {
    return {
        apikey: storageKey,
        authorization: `Bearer ${storageKey}`,
        ...additionalHeaders,
    };
}

async function listStoredPhotos() {
    const photos = [];
    const pageSize = 1000;
    let offset = 0;

    while (true) {
        const response = await fetch(
            `${storageBaseUrl}/storage/v1/object/list/${encodeURIComponent(storageBucket)}`,
            {
                method: "POST",
                headers: getStorageHeaders({ "content-type": "application/json" }),
                body: JSON.stringify({
                    prefix: "",
                    limit: pageSize,
                    offset,
                    sortBy: { column: "created_at", order: "desc" },
                }),
            },
        );
        if (!response.ok) {
            throw new Error(`Photo list request failed (${response.status}).`);
        }

        const objects = await response.json();
        if (!Array.isArray(objects)) {
            throw new Error("Photo storage returned an invalid list.");
        }

        for (const object of objects) {
            if (!object.name || !object.metadata?.mimetype?.startsWith("image/")) continue;
            photos.push({
                url: `${storageBaseUrl}/storage/v1/object/public/${encodeURIComponent(storageBucket)}/${encodeURIComponent(object.name)}`,
                alt: "Uploaded photo",
            });
        }

        if (objects.length < pageSize) break;
        offset += pageSize;
    }

    return photos;
}

async function refreshPhotoCatalog() {
    const storedPhotos = await listStoredPhotos();
    photoCatalog = [...storedPhotos, ...originalPhotos];
    renderPhotoCollage();
}

async function uploadPhoto(file) {
    const extension = file.name.match(/\.[a-z0-9]{1,10}$/i)?.[0].toLowerCase() ?? "";
    const objectName = `${crypto.randomUUID()}${extension}`;
    const response = await fetch(
        `${storageBaseUrl}/storage/v1/object/${encodeURIComponent(storageBucket)}/${encodeURIComponent(objectName)}`,
        {
            method: "POST",
            headers: getStorageHeaders({
                "cache-control": "3600",
                "content-type": file.type,
                "x-upsert": "false",
            }),
            body: file,
        },
    );
    if (!response.ok) {
        throw new Error(`Photo upload failed (${response.status}).`);
    }

    return {
        url: `${storageBaseUrl}/storage/v1/object/public/${encodeURIComponent(storageBucket)}/${encodeURIComponent(objectName)}`,
        alt: "Uploaded photo",
    };
}

addPhotosButton.addEventListener("click", () => {
    if (!storageConfigured) {
        photoUploadStatus.textContent = "Shared photo storage is not configured yet. Follow PHOTO_STORAGE_SETUP.md to enable uploads.";
        return;
    }
    photoUpload.click();
});

photoUpload.addEventListener("change", async () => {
    const files = Array.from(photoUpload.files ?? []);
    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const rejectedCount = files.length - imageFiles.length;
    const oversizedFiles = imageFiles.filter((file) => file.size > maximumPhotoSize);
    const uploadableFiles = imageFiles.filter((file) => file.size <= maximumPhotoSize);

    if (!uploadableFiles.length && (rejectedCount || oversizedFiles.length)) {
        const messages = [];
        if (rejectedCount) messages.push(`Skipped ${rejectedCount} non-image file${rejectedCount === 1 ? "" : "s"}.`);
        if (oversizedFiles.length) messages.push(`Photos must be 10 MB or smaller; skipped ${oversizedFiles.length}.`);
        photoUploadStatus.textContent = messages.join(" ");
        photoUpload.value = "";
        return;
    }

    const failedFiles = [];
    let uploadedCount = 0;
    for (const file of uploadableFiles) {
        try {
            const photo = await uploadPhoto(file);
            photoCatalog.unshift(photo);
            uploadedCount += 1;
            renderPhotoCollage();
            photoUploadStatus.textContent = `Uploading photos… ${uploadedCount} of ${uploadableFiles.length} saved.`;
        } catch (error) {
            console.error(`Could not upload ${file.name}.`, error);
            failedFiles.push(file.name);
        }
    }

    let refreshFailed = false;
    if (uploadedCount) {
        try {
            await refreshPhotoCatalog();
        } catch (error) {
            console.error("Could not refresh the shared photo catalog.", error);
            refreshFailed = true;
        }
    }

    const messages = [];
    if (uploadedCount) {
        messages.push(`Added ${uploadedCount} photo${uploadedCount === 1 ? "" : "s"} to the shared collage.`);
    }
    if (failedFiles.length) {
        messages.push(`Could not upload ${failedFiles.length} photo${failedFiles.length === 1 ? "" : "s"}.`);
    }
    if (rejectedCount) {
        messages.push(`Skipped ${rejectedCount} non-image file${rejectedCount === 1 ? "" : "s"}.`);
    }
    if (oversizedFiles.length) {
        messages.push(`Photos must be 10 MB or smaller; skipped ${oversizedFiles.length}.`);
    }
    if (refreshFailed) {
        messages.push("The shared catalog could not be refreshed; reload to try again.");
    }
    photoUploadStatus.textContent = messages.join(" ");
    photoUpload.value = "";
});

function showPhoto(index) {
    if (!photoCatalog.length) return;

    currentPhotoIndex = (index + photoCatalog.length) % photoCatalog.length;
    const photo = photoCatalog[currentPhotoIndex];
    viewerImage.src = photo.url;
    viewerImage.alt = photo.alt;
    viewerCaption.textContent = photo.alt || "Photo";
    viewerPosition.textContent = `${currentPhotoIndex + 1} / ${photoCatalog.length}`;
    previousPhotoButton.disabled = photoCatalog.length < 2;
    nextPhotoButton.disabled = photoCatalog.length < 2;
}

photoCollage.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const photo = event.target.closest(".photo-slot-image");
    if (!photo) return;

    const figure = photo.closest(".photo-slot");
    if (!figure) return;
    showPhoto(Number(figure.dataset.photoIndex));
    photoViewer.showModal();
});

closeViewerButton.addEventListener("click", () => photoViewer.close());
previousPhotoButton.addEventListener("click", () => showPhoto(currentPhotoIndex - 1));
nextPhotoButton.addEventListener("click", () => showPhoto(currentPhotoIndex + 1));

photoViewer.addEventListener("click", (event) => {
    if (event.target === photoViewer) photoViewer.close();
});

photoViewer.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPhoto(currentPhotoIndex - 1);
    } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showPhoto(currentPhotoIndex + 1);
    }
});

if (storageConfigured) {
    photoUploadStatus.textContent = "Loading shared photos…";
    refreshPhotoCatalog().catch((error) => {
        photoUploadStatus.textContent = "Could not load shared photos. Check the storage setup and reload.";
        console.error("Could not load the shared photo catalog.", error);
    });
} else {
    photoUploadStatus.textContent = "Shared photo storage is not configured yet.";
}
