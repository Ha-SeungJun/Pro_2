import axios from "./axios"; // Ensure you have a configured axios instance

// API base URL from environment variables
const API_BASE = import.meta?.env?.VITE_API_BASE || process.env.REACT_APP_API_BASE || "http://localhost:8080";

/**
 * Fetches report details for a given delivery number.
 * @param {string} deliveryNumber - The delivery number to get details for.
 * @returns {Promise<{memberId: string, driverId: string}>} - A promise that resolves to the report details.
 */
export const getReportDetailsByDeliveryNumber = async (deliveryNumber) => {
  try {
    // The endpoint should be confirmed with the backend team.
    // Assuming an endpoint like /api/report/details/{deliveryNumber}
    const response = await axios.get(`/api/report/details/${deliveryNumber}`);
    return response.data; // Assuming the response body is { memberId: "...", driverId: "..." }
  } catch (error) {
    console.error("Error fetching report details:", error);
    // You might want to throw the error to be handled by the component
    // or return a default object.
    throw error;
  }
};
