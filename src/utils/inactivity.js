// src/utils/inactivity.js
let logoutTimer;
const MAX_INACTIVITY_TIME = 10 * 60 * 1000; // 10 minutos

const logout = () => {
    localStorage.clear();
    window.location.href = "/gstock";
};

export const resetInactivityTimer = () => {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(logout, MAX_INACTIVITY_TIME);
};

export const startInactivityListener = () => {
    ["mousemove", "keydown", "click"].forEach((event) =>
        window.addEventListener(event, resetInactivityTimer)
    );
    resetInactivityTimer();
};
