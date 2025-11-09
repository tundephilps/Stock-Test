import axios from 'axios';

const API_KEY = 'd46s5qpr01qgc9eubae0d46s5qpr01qgc9eubaeg';
const BASE_URL = 'https://finnhub.io/api/v1';

export const fetchStockPrice = async (symbol: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/quote`, {
            params: {
                symbol,
                token: API_KEY,
            },
        });
        console.log('API Response:', response.data);
        return { price: response.data.c };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data?.message || JSON.stringify(error.response.data) || 'Unknown API error';
            throw new Error(errorMessage);
        }
        throw new Error('Failed to fetch stock price');
    }
};

export const fetchCompanyProfile = async (symbol: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/stock/profile2`, {
            params: {
                symbol,
                token: API_KEY,
            },
        });
        console.log('Company Profile API Response:', response.data);
        return { name: response.data.name, ticker: response.data.ticker };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data?.message || JSON.stringify(error.response.data) || 'Unknown API error';
            throw new Error(errorMessage);
        }
        throw new Error('Failed to fetch company profile');
    }
};

export const searchStockSymbols = async (query: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/search`, {
            params: {
                q: query,
                token: API_KEY,
            },
        });
        console.log('Search API Response:', response.data);
        return response.data.result.map((item: any) => ({ symbol: item.symbol, description: item.description }));
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data?.message || JSON.stringify(error.response.data) || 'Unknown API error';
            throw new Error(errorMessage);
        }
        throw new Error('Failed to search stock symbols');
    }
};