import { useCallback } from 'react';

// This hook centralizes the logic for calling our secure backend Lambda.
// By using this, we no longer need to manage complex API Gateway setups in multiple places.
export function useBackendApi() {
  const callBackend = useCallback(async (action, payload) => {
    // This is the single, reliable backend URL the app will use.
    const API_BASE_URL = "https://wz6iiek7kuovyx2bo3xudagf7m0asrpt.lambda-url.us-east-2.on.aws/";

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ action, ...payload }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Backend response not OK:", response.status, errorBody);
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success === false) {
        console.error("Backend returned an error:", result.details || result.error);
        throw new Error(result.details || result.error || 'An unknown backend error occurred.');
      }
      
      return result.data;

    } catch (error) {
      console.error(`Error calling backend action "${action}":`, error);
      throw error;
    }
  }, []);

  return { callBackend };
}