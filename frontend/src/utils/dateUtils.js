export const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';

    let date;
    if (typeof timestamp === 'number') {
        // Unix seconds if below year 2001 in ms threshold
        date = timestamp < 1_000_000_000_000
            ? new Date(timestamp * 1000)
            : new Date(timestamp);
    } else {
        date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleString('en-US', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

export const formatTimeOnly = (timestamp) => {
    if (!timestamp) return 'N/A';

    let date;
    if (typeof timestamp === 'number') {
        date = timestamp < 1_000_000_000_000
            ? new Date(timestamp * 1000)
            : new Date(timestamp);
    } else {
        date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return 'Invalid Time';

    return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};
