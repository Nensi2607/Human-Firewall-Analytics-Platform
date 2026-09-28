const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="placeholder-page">
      <p className="section-kicker">Dashboard Section</p>
      <h1>{title}</h1>
      <p className="placeholder-copy">{description}</p>
      <div className="placeholder-box">
        This page is intentionally left as a placeholder for the next teammate
        to implement.
      </div>
    </div>
  );
};

export default PlaceholderPage;
