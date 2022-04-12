import axios from 'axios';

const downloadRSS = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);

export default downloadRSS;
