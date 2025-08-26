import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const fetchCodingAssistant = async (prompt) => {
    const response = await axios.post(`${API_BASE_URL}/ai/coding-assistant`, { prompt });
    return response.data;
};

export const fetchRegexResults = async (regex, testString) => {
    const response = await axios.post(`${API_BASE_URL}/ai/regex`, { regex, testString });
    return response.data;
};

export const fetchRepoQA = async (repo, question) => {
    const response = await axios.post(`${API_BASE_URL}/ai/repo-qa`, { repo, question });
    return response.data;
};