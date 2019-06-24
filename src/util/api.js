import axios from 'axios';

export const Api = () => {
    const base_url = 'https://api.airtable.com/v0/appGudhHSPRS9Mg91'
    const defaultOptions = {
        headers: {
            "Content-Type": 'application/json',
            "Authorization" : 'Bearer ' + 'keyyETxpFauOV7MdI'
        },
    };

    return {
        get: (url, options = {}) => {
            return axios.get(base_url + url, { ...defaultOptions, ...options });
        },
        post: (url, data, options = {}) => { 
            return axios.post(base_url + url, data, { ...defaultOptions, ...options })
        },
        delete: (url, options = {}) => { 
            return axios.delete(base_url + url, { ...defaultOptions, ...options })
        },
    };
};