/**
 * Formats a date string into a readable format like "June 13th" or "Dec 25th, 2024".
 * @param {string} dateString - A date string like "2025-06-13".
 * @returns {string} The formatted date string.
 */
export default function formatWorkoutDate(dateString) {
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    const today = new Date();

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    // Function to get the ordinal suffix (st, nd, rd, th)
    const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;

    if (year === today.getFullYear()) {
        return `${month} ${dayWithSuffix}`; // e.g., "June 13th"
    } else {
        return `${month} ${dayWithSuffix}, ${year}`; // e.g., "Dec 25th, 2024"
    }
};