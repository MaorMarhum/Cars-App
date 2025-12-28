import axios from "axios";

export const api = axios.create({
  baseURL: "https://data.gov.il/api/3/action",
  headers: {
    "Content-Type": "application/json",
  },
});