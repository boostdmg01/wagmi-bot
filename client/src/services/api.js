import axios from 'axios'
import router from '@/router/index'

const API = function () {
    this.client = axios.create({
        baseURL: process.env.VUE_APP_API_URL,
        withCredentials: true
    });

    this.request = async (endpoint, data = {}, method = 'GET') => {
        try {
            let options = {
                url: endpoint,
                method: method
            }

            if (method === 'GET') {
                options.params = data
            } else {
                options.data = data
            }
            return await this.client(options)
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