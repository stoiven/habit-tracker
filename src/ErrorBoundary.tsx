import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("HabiCard error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            background: "#fafafa",
            color: "#111",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", marginBottom: 8 }}>Something went wrong</h1>
          <pre
            style={{
              padding: 16,
              background: "#fee",
              borderRadius: 8,
              overflow: "auto",
              maxWidth: "100%",
              fontSize: 12,
            }}
          >
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
