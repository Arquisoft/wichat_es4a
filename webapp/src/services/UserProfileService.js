import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const getUserHistory = async (token) => {
    try {
        const response = await axios.get(`${apiEndpoint}/api/game/history/gameList`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error en UserProfileService - getUserHistory:", error);
    }
}


const getQuestionsById = async (gameId) => {
    try {
        const content = {
            "gameId": gameId
        }

        const response = await axios.post(`${apiEndpoint}/api/game/history/gameQuestions`, content);
        return response.data;
    } catch (error) {
        console.error("Error en UserProfileService - getGameHistoryById:", error);
    }
}

const changePassword = async (token, currentPassword, newPassword) => {
    try {
        const response = await axios.post(
            `${apiEndpoint}/api/user/editUser`,
            {   // Request Body (data)
                currentPassword,
                newPassword
            },
            {   // Options (including headers)
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error en UserProfileService - changePassword:", error);
    }
}

export { getUserHistory, getQuestionsById , changePassword};