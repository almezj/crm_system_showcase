import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.patch = (url, data) => {
  return api({
    method: 'PATCH',
    url,
    data,
  });
};

export default api;