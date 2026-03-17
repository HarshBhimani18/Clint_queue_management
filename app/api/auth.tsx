import axios from "axios"

export const api = axios.create({
  baseURL: "https://cmsback.sampaarsh.cloud",
  headers: {
    "Content-Type": "application/json",
  },
})
