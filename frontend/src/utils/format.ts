/**
 * Format a number as currency
 * @param amount The amount to format
 * @returns The formatted currency string
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format a date string to a readable format
 * @param dateString The date string to format
 * @returns The formatted date string
 */
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format a date-time string to a readable format
 * @param dateString The date-time string to format
 * @returns The formatted date-time string
 */
export const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}; 