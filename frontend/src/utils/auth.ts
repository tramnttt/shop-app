// Auth utility functions

/**
 * Get the authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

/**
 * Set the authentication token in localStorage
 * @param token The token to store
 */
export const setAuthToken = (token: string): void => {
    localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = (): void => {
    localStorage.removeItem('token');
};

/**
 * Check if the user is authenticated
 * @returns True if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!getAuthToken();
};

/**
 * Get user role from localStorage
 * @returns The user role or null if not found
 */
export const getUserRole = (): string | null => {
    return localStorage.getItem('userRole');
};

/**
 * Set user role in localStorage
 * @param role The role to store
 */
export const setUserRole = (role: string): void => {
    localStorage.setItem('userRole', role);
};

/**
 * Check if the user has admin role
 * @returns True if the user has admin role
 */
export const isAdmin = (): boolean => {
    const role = getUserRole();
    const user = localStorage.getItem('user');
    console.log('Current user role from getUserRole():', role);

    if (user) {
        try {
            const userData = JSON.parse(user);
            console.log('User data from localStorage:', userData);
            console.log('User role from userData:', userData.role);

            // Check both sources for role information
            return (role === 'admin') || (userData.role === 'admin');
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }

    console.log('Is admin check result:', role === 'admin');
    return role === 'admin';
}; 