<script setup lang="ts">
import {
    useTokenClient,
    type AuthCodeFlowSuccessResponse,
    type AuthCodeFlowErrorResponse,
} from "vue3-google-signin";
import { useStorage } from '@vueuse/core';

const access_token = useStorage('access_token')
const credentials = useStorage('credentials')
const isAuth = useStorage('isAuth', true)

const handleOnSuccess = (response: AuthCodeFlowSuccessResponse) => {
    access_token.value = response.access_token
    credentials.value = JSON.stringify(response)
    isAuth.value = true
};

const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
    console.log("Error: ", errorResponse);
};
const scpopes = <string[]>[
    'email', 'profile',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.appfolder',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.scripts',
    'https://www.googleapis.com/auth/drive.metadata']

const { isReady, login } = useTokenClient({
    scope: scpopes,
    onSuccess: handleOnSuccess,
    onError: handleOnError,
    // other options
});

const { params, files, currentFile, getFiles } = useDrive();
const { sheetList, currentDataSheet, getAllSheetByFile, getSheetData } = useSheet();
const signIn = async () => {
    login();
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
const isLoadingFiles = ref(false);
const getFilesDrive = async () => {
    isLoadingFiles.value = true;
    const payload = {
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: 'files(id, name, modifiedTime, ownedByMe, exportLinks)',
        corpus: 'user',
        orderBy: 'modifiedTime desc',
        ...params
    };
    const response = await getFiles(payload);
    
    isLoadingFiles.value = false;
    files.value = response.data.files.filter((file: any) => file.ownedByMe);
}

const getAllSheet = async (file: any) => {
    currentFile.value = file

    const { data } = await getAllSheetByFile(file.id);
    sheetList.value = data.sheets;
};
const loadingSheetData = ref(false);
const getDataOfSheetByTitle = async ({ range }: { range: { title: string, start: string, end: string } }) => {
    loadingSheetData.value = true;
    const { data } = await getSheetData(currentFile.value.id, range);
    currentDataSheet.value = data.values;
    loadingSheetData.value = false;
};

watch(isReady, async (value) => {
    console.log(value);
    
    if (value) {
        await getFilesDrive();
    }
});
</script>
<template>
    <div class="p-4">
        <div v-if="isReady">
            <p class="text-green-500 flex space-x-2 items-center">
                <span>SERVER</span>
                <span class="inline-block w-2 h-2 rounded bg-green-500 animate-ping" />
            </p>
        </div>
        <div v-else class="text-red-500">
            <p class="flex space-x-2 items-center">
                <span>SERVER</span>
                <span class="inline-block w-2 h-2 rounded bg-red-500" />
            </p>
        </div>
        <UButton v-if="!isAuth" class="mt-4" color="white" icon="devicon:google" @click="signIn">Sign In</UButton>
        <template v-else>
            <div class="flex space-x-4 items-center">
            <span>YOUR FILES</span>
            <UButton color="blue" :loading="isLoadingFiles" icon="material-symbols:sync"
                :ui="{ rounded: 'rounded-full' }" @click="getFilesDrive"></UButton>
            </div>
            <DriveList :files="files" @get-sheet="getAllSheet" />
            <SheetList v-if="currentFile" :loading="loadingSheetData" :sheet-id="currentFile.id" :sheets="sheetList" :current-data-sheet="currentDataSheet"
                :current-file="currentFile.name" @get-data="getDataOfSheetByTitle" /> 
        </template>
    </div>
</template>