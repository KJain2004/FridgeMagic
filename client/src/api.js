import axios from 'axios';

const apiHost = import.meta.env.VITE_API_HOST;

axios.defaults.baseURL = apiHost ? `https://${apiHost}` : '';

export default axios;
