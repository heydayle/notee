let sheetRange = "Genegal!A2:E15";
import { google } from 'googleapis';

const getVars = () => {
    const SPREAD_SHEET_ID = useRuntimeConfig().public.SPREAD_SHEET_ID;
    const GOOGLE_API_KEY = useRuntimeConfig().public.GOOGLE_API_KEY;
    const TOKEN = localStorage.getItem('access_token');

    return { SPREAD_SHEET_ID, GOOGLE_API_KEY, TOKEN }
}
export async function allRows() {
    const { getCsrfToken, getProviders, getSession, data } = useAuth();
    const { SPREAD_SHEET_ID, GOOGLE_API_KEY, TOKEN } = getVars();
    
    const token = await getCsrfToken();
    const session = await getSession();
    const provider = await getProviders();

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}`
    return await useFetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: {
            access_token: token,
        }
    })
}

export async function getAllSheet(data: any) {
    const { SPREAD_SHEET_ID, GOOGLE_API_KEY } = getVars();

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}/values/${sheetRange}?key=${GOOGLE_API_KEY}`
    return await useFetch(url)
}

export async function singleRow(row: any) {
    const { SPREAD_SHEET_ID, GOOGLE_API_KEY } = getVars();

    const rowRange = `Sheet1!A${row}:D${row}`

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}/values/${rowRange}?key=${GOOGLE_API_KEY}`
    return await useFetch(url)
}