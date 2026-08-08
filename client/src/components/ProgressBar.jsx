function ProgressBar({ current, total }) {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div style={{ marginBottom: "25px" }}>
      <div
        style={{
          width: "100%",
          height: "12px",
          background: "#E5E7EB",
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "#2563EB",
            borderRadius: "10px",
            transition: "0.3s",
          }}
        />
      </div>

      <p style={{ marginTop: "8px" }}>
        Progress: {Math.round(percentage)}%
      </p>
    </div>
  );
}

export default ProgressBar;