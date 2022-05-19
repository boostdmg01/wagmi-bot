import axios from 'axios'
import config from '@/config.json'
import router from '@/router/index'

const API = function () {
    this.client = axios.create({
        baseURL: config.API_URL
    });

    this.request = async (endpoint, data = {}, method = 'GET') => {
        try {
            return await this.client({
                url: endpoint,
                method: method,
                data: data
            })
        } catch (error) {
            return this.onError(error)
        }
    }

    this.onError = (error) => {
        console.error('Request Failed:', error.config);

        if (error.response) {
            if (error.response.status === 400) {
                router.push({ path: '/admin/login' })
            }

            console.error('Data:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }

        return Promise.reject(error.response || error.message);
    }

    return this
}

export default new API()