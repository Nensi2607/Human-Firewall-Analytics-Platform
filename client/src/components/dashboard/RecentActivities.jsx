const RecentActivities = () => {
  const activities = [
    {
      id: 1,
      employee: "John Smith",
      activity: "Completed Security Awareness Training",
      status: "Completed",
    },
    {
      id: 2,
      employee: "Alice Johnson",
      activity: "Clicked Phishing Simulation",
      status: "High Risk",
    },
    {
      id: 3,
      employee: "David Miller",
      activity: "Reported Suspicious Email",
      status: "Safe",
    },
    {
      id: 4,
      employee: "Emma Wilson",
      activity: "Password Updated",
      status: "Completed",
    },
  ];

  return (
   <div
  style={{
    marginTop: "35px",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  }}
>
      <h2
  style={{
    color: "#111827",
    marginBottom: "20px",
  }}
>
  Recent Security Activities
</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#1f252f",
            }}
          >
            <th style={{ padding: "12px" }}>Employee</th>
            <th>Activity</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
  {activities.map((item) => (
    <tr key={item.id}>
      <td>{item.employee}</td>

      <td>{item.activity}</td>

      <td>
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "20px",
            background:
              item.status === "Completed"
                ? "#DCFCE7"
                : item.status === "High Risk"
                ? "#FEE2E2"
                : "#DBEAFE",

            color:
              item.status === "Completed"
                ? "#166534"
                : item.status === "High Risk"
                ? "#B91C1C"
                : "#1D4ED8",

            fontWeight: "600",
          }}
        >
          {item.status}
        </span>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
};

export default RecentActivities;