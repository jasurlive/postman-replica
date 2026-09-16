import { useState } from "react";

export type Header = { key: string; value: string };
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type AuthType = "none" | "bearer" | "apikey";

export type ResponseData = {
  status: number;
  statusText: string;
  timeMs: number;
  headers: [string, string][];
  body: string;
};

const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function useAPI() {
  const [method, setMethod] = useState<Method>("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/users");
  const [headers, setHeaders] = useState<Header[]>([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [authType, setAuthType] = useState<AuthType>("none");
  const [token, setToken] = useState("");
  const [apiKeyName, setApiKeyName] = useState("x-api-key");
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasBody = method === "POST" || method === "PUT" || method === "PATCH";

  function updateHeader(i: number, field: keyof Header, value: string) {
    setHeaders((current) =>
      current.map((header, index) =>
        index === i ? { ...header, [field]: value } : header
      )
    );
  }

  function addHeader() {
    setHeaders((current) => [...current, { key: "", value: "" }]);
  }

  function removeHeader(i: number) {
    setHeaders((current) => current.filter((_, index) => index !== i));
  }

  async function sendRequest() {
    setLoading(true);
    setError("");
    setResponse(null);

    const reqHeaders: Record<string, string> = {};

    for (const header of headers) {
      if (header.key.trim()) {
        reqHeaders[header.key.trim()] = header.value;
      }
    }

    if (authType === "bearer" && token) {
      reqHeaders.Authorization = `Bearer ${token}`;
    }

    if (authType === "apikey" && token) {
      reqHeaders[apiKeyName || "x-api-key"] = token;
    }

    if (hasBody && body && !reqHeaders["Content-Type"]) {
      reqHeaders["Content-Type"] = "application/json";
    }

    const start = performance.now();

    try {
      const res = await fetch(url, {
        method,
        headers: reqHeaders,
        body: hasBody && body ? body : undefined,
      });

      const text = await res.text();

      let pretty = text;

      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {}

      setResponse({
        status: res.status,
        statusText: res.statusText,
        timeMs: Math.round(performance.now() - start),
        headers: [...res.headers.entries()],
        body: pretty,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return {
    METHODS,
    method,
    setMethod,
    url,
    setUrl,
    headers,
    body,
    setBody,
    authType,
    setAuthType,
    token,
    setToken,
    apiKeyName,
    setApiKeyName,
    response,
    error,
    loading,
    hasBody,
    updateHeader,
    addHeader,
    removeHeader,
    sendRequest,
  };
}