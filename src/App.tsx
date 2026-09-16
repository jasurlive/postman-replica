import "./App.css";
import useAPI, { type Method, type AuthType } from "./useAPI";

export default function App() {
  const {
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
  } = useAPI();

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
                onChange={(e) => setAuthType(e.target.value as AuthType)}
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
                  placeholder={authType === "bearer" ? "Token" : "Key value"}
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
                    onChange={(e) => updateHeader(i, "key", e.target.value)}
                    placeholder="Key"
                  />

                  <input
                    value={header.value}
                    onChange={(e) => updateHeader(i, "value", e.target.value)}
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

                <div className="response-time">{response.timeMs} ms</div>
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