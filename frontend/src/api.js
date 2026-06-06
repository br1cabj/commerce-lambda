/**
 * Configuración centralizada de la API para Onda Basquete.
 * Facilita la conexión entre el Frontend y el Backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Función genérica para realizar peticiones a la API.
 */
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Intentamos parsear el JSON, pero manejamos casos donde no hay cuerpo
        let data = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (!response.ok) {
            // Si el backend envió un error de validación (Joi), extraemos los detalles
            const errorMessage = data.details || data.message || 'Ocurrió un error inesperado';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
    }
}

export const api = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
    
    // Para subida de archivos (no JSON)
    postFile: (endpoint, formData) => {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        return fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        }).then(async res => {
            const data = await res.json();
            if(!res.ok) throw new Error(data.message || 'Error al subir archivo');
            return data;
        });
    }
};

export default api;
