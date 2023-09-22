import { TabInput } from "../types";

const BASE_URL = process.env.OPENAPI_BASE_ORIGIN || "http://localhost:3005";
const THIRDWEB_API_SECRET_KEY = process.env.REACT_APP_THIRDWEB_API_SECRET_KEY;

export async function createConfig(
  tabName: string,
  configData: TabInput["awsKms"] | TabInput["gcpKms"] | TabInput["local"],
) {
  try {
    // Fetch data from API
    const url = `${BASE_URL}/config/create`;
    const configType = tabName.split("-")[0];

    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${THIRDWEB_API_SECRET_KEY}`,
      },
      body: JSON.stringify({ [configType]: { ...configData } }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.result;
  } catch (error) {
    throw error;
  }
}