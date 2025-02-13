<script setup lang="ts">
import {
    useTokenClient,
    type AuthCodeFlowSuccessResponse,
    type AuthCodeFlowErrorResponse,
} from "vue3-google-signin";

const handleOnSuccess = (response: AuthCodeFlowSuccessResponse) => {
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("credentials", JSON.stringify(response));

};

const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
    console.log("Error: ", errorResponse);
};

const { isReady, login } = useTokenClient({
    scope: ['email', 'profile', 'https://www.googleapis.com/auth/spreadsheets'],
    onSuccess: handleOnSuccess,
    onError: handleOnError,
    // other options
});

const { status } = useAuth()

const signIn = async () => {
    login();
};
const getAllRows = async () => {
    // const { data } = await allRows();
    const { data } = await useFetch('/api/get-all-sheet', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: {
            credentials: localStorage.getItem('credentials')
        }
    });
    console.log(data.value);
};
const getChatId = async () => {
    await useFetch('/api/telegram-bot', {
        method: 'POST',
        body: {
            message: {
                text: 'Hello @wawahuy',
            }
        }
    });
}
</script>
<template>
    <div>
        {{ status }}
        <button @click="getAllRows">Get All Rows</button>
        <button @click="signIn">Sign In</button>
        <button @click="getChatId">Get Chat Id</button>
        <div v-if="isReady">
            <p>Ready</p>
        </div>
        <div v-else>
            <p>Not Ready</p>
        </div>
    </div>
</template>