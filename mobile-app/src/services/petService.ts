import { API_BASE_URL, getClientToken } from "./apiClient";

export { API_BASE_URL };

export interface CreatePetPayload {
  name?: string;
  petType: string;
  age: number;
  lastVetVisitDate?: string;
  vaccinationRecordUrl?: string;
  photoUrl?: string;
}

export async function savePetRequest(
  payload: CreatePetPayload,
  token?: string,
  petId?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token || getClientToken()) {
    headers.Authorization = "Bearer " + (token || getClientToken());
  }

  const url = petId ? `${API_BASE_URL}/pets/${petId}` : `${API_BASE_URL}/pets`;
  const method = petId ? "PATCH" : "POST";

  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message || data?.error || "Failed to save pet details on server.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return data?.pet ?? data?.data ?? data;
}