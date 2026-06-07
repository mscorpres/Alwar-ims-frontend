import React from "react";

const keyframes = `
  @keyframes plugLeft {
    0%, 100% { transform: translateX(0px); }
    50%       { transform: translateX(12px); }
  }
  @keyframes plugRight {
    0%, 100% { transform: translateX(0px); }
    50%       { transform: translateX(-12px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function Maintenance() {
  return (
    <>
      <style>{keyframes}</style>
      <div
        style={{
          height: "100vh",
          width: "100%",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "'Segoe UI', Arial, sans-serif",
        }}
      >
        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <img
            src="/assets/images/ms.png"
            alt="Logo"
            style={{
              height: 48,
              objectFit: "contain",
              marginBottom: 40,
              animation: "fadeUp 0.5s ease both",
            }}
          />

          <h1
            style={{
              fontSize: "clamp(26px, 4vw, 44px)",
              fontWeight: 800,
              color: "#1a1a2e",
              margin: "0 0 16px",
              lineHeight: 1.2,
              animation: "fadeUp 0.6s 0.1s ease both",
            }}
          >
            IMS is currently
            <br />
            down for maintenance
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "#6b7280",
              margin: "0 0 56px",
              lineHeight: 1.6,
              animation: "fadeUp 0.6s 0.2s ease both",
            }}
          >
            We apologize for any inconvenience caused.
            <br />
            We're almost done — please check back shortly.
          </p>

          {/* Animated plugs */}
          <div
            style={{
              width: "min(520px, 90vw)",
              position: "relative",
              animation: "fadeUp 0.6s 0.3s ease both",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "50%",
                height: "100%",
                overflow: "hidden",
                animation: "plugLeft 2.4s ease-in-out infinite",
              }}
            >
              <img
                src="/assets/images/maintenance-plugs.png"
                alt=""
                style={{ width: "200%", display: "block" }}
              />
            </div>

            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "50%",
                height: "100%",
                overflow: "hidden",
                animation: "plugRight 2.4s ease-in-out infinite",
              }}
            >
              <img
                src="/assets/images/maintenance-plugs.png"
                alt=""
                style={{ width: "200%", display: "block", marginLeft: "-100%" }}
              />
            </div>

            <img
              src="/assets/images/maintenance-plugs.png"
              alt="Under construction"
              style={{ width: "100%", visibility: "hidden", display: "block" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            width: "100%",
            borderTop: "1px solid #e5e7eb",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 40,
            color: "#6b7280",
            fontSize: 13,
            animation: "fadeUp 0.6s 0.4s ease both",
          }}
        >
          <span>You can contact us:</span>
          <span>
            Phone:{" "}
            <a href="tel:+917529939393" style={{ color: "#374151", textDecoration: "none" }}>
              +91 75-29 93-93-93
            </a>
          </span>
          <span>
            Email:{" "}
            <a href="mailto:iot@mscorpres.in" style={{ color: "#374151", textDecoration: "none" }}>
              iot@mscorpres.in
            </a>
          </span>
        </div>
      </div>
    </>
  );
}
