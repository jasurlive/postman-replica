import { useState } from "react";
import "./App.css";

type Header = { key: string; value: string };

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
type Method = (typeof METHODS)[number];
type AuthType = "none" | "bearer" | "apikey";

type ResponseData = {
  status: number;
  statusText: string;
  timeMs: number;
  headers: [string, string][];
  body: string;
};

export default function App() {
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
    const next = [...headers];
    next[i][field] = value;
    setHeaders(next);
  }

  function addHeader() {
    setHeaders([...headers, { key: "", value: "" }]);
  }

  function removeHeader(i: number) {
    setHeaders(headers.filter((_, index) => index !== i));
  }

  async function sendRequest() {
    setLoading(true);
    setError("");
    setResponse(null);

    const reqHeaders: Record<string, string> = {};

    for (const header of headers) {
      if (header.key.trim()) reqHeaders[header.key.trim()] = header.value;
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

  return (
    <main className="api-app">
      <section className="api-shell">
        <header className="api-header">
          <div>
            <div className="api-logo">
              POSTMAN<span>·</span>REPLICA
            </div>
            <div className="api-subtitle">Designed by @jasurlive</div>
          </div>

          <div className="api-status">
            <span />
            Ready
          </div>
        </header>

        <div className="request-bar">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
            className={`method method-${method.toLowerCase()}`}
          >
            {METHODS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="url-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") sendRequest();
            }}
          />

          <button
            onClick={sendRequest}
            disabled={loading || !url}
            className="send-button"
          >
            {loading ? "Sending" : "Send"}
            <span>↵</span>
          </button>
        </div>

        <div className="workspace">
          <section className="panel">
            <div className="panel-title">
              <span>Authentication</span>

              <select
                value={authType}
                onChange={(e) =>
                  setAuthType(e.target.value as AuthType)
                }
              >
                <option value="none">None</option>
                <option value="bearer">Bearer token</option>
                <option value="apikey">API key</option>
              </select>
            </div>

            {authType !== "none" && (
              <div className="auth-fields">
                {authType === "apikey" && (
                  <input
                    value={apiKeyName}
                    onChange={(e) => setApiKeyName(e.target.value)}
                    placeholder="Header name"
                  />
                )}

                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={
                    authType === "bearer" ? "Token" : "Key value"
                  }
                  type="password"
                />
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-title">
              <span>Headers</span>

              <button onClick={addHeader} className="add-button">
                + Add header
              </button>
            </div>

            <div className="headers-list">
              {headers.map((header, i) => (
                <div className="header-row" key={i}>
                  <input
                    value={header.key}
                    onChange={(e) =>
                      updateHeader(i, "key", e.target.value)
                    }
                    placeholder="Key"
                  />

                  <input
                    value={header.value}
                    onChange={(e) =>
                      updateHeader(i, "value", e.target.value)
                    }
                    placeholder="Value"
                  />

                  <button onClick={() => removeHeader(i)}>×</button>
                </div>
              ))}
            </div>
          </section>

          {hasBody && (
            <section className="panel">
              <div className="panel-title">
                <span>Request body</span>
                <span className="panel-hint">JSON</span>
              </div>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                spellCheck={false}
              />
            </section>
          )}

          {error && <div className="error-box">{error}</div>}

          {response && (
            <section className="response-panel">
              <div className="response-top">
                <div className="response-info">
                  <span
                    className={
                      response.status < 300
                        ? "status-success"
                        : response.status < 400
                        ? "status-redirect"
                        : "status-error"
                    }
                  >
                    {response.status}
                  </span>

                  <span>{response.statusText || "Response"}</span>
                </div>

                <div className="response-time">
                  {response.timeMs} ms
                </div>
              </div>

              <details className="response-headers">
                <summary>
                  Response headers
                  <span>{response.headers.length}</span>
                </summary>

                <div className="response-header-list">
                  {response.headers.map(([key, value]) => (
                    <div key={key}>
                      <b>{key}</b>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </details>

              <pre>{response.body}</pre>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}