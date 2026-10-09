import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  changeMyPassword,
  getMyAdminSummary,
  getMyAssignedQuizzes,
  getMyPhishingHistory,
  getMyProfile,
  getMyQuizResultsForProfile,
  getMyRiskAssessment,
  getMyTopRecommendations,
  getMyTrainingProgress,
  getMyTrainings,
  updateMyProfile,
} from "../services/profileService";

const getInitials = (user) => `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";
const getId = (value) => String(value?._id || value || "");
const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleDateString();
};
const formatPercent = (value) => Number.isFinite(value) ? `${Math.round(value * 10) / 10}%` : "Not available";
const getQuizScore = (result) => {
  if (Number.isFinite(result.percentage)) return result.percentage;
  if (result.totalQuestions > 0 && Number.isFinite(result.correctAnswers)) {
    return (result.correctAnswers / result.totalQuestions) * 100;
  }
  return null;
};
const createSectionState = () => ({ loading: true, error: "", data: null });

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", designation: "", profileImage: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [sections, setSections] = useState({
    risk: createSectionState(),
    quizzes: createSectionState(),
    results: createSectionState(),
    trainings: createSectionState(),
    trainingProgress: createSectionState(),
    phishing: createSectionState(),
    recommendations: createSectionState(),
    adminSummary: createSectionState(),
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const currentProfile = await getMyProfile();
        if (!active) return;
        setProfile(currentProfile);
        setProfileForm({
          firstName: currentProfile.firstName || "",
          lastName: currentProfile.lastName || "",
          designation: currentProfile.designation || "",
          profileImage: currentProfile.profileImage || "",
        });

        const loadSection = async (key, request) => {
          try {
            const data = await request();
            if (active) setSections((current) => ({ ...current, [key]: { loading: false, error: "", data } }));
          } catch (error) {
            if (active) setSections((current) => ({
              ...current,
              [key]: {
                loading: false,
                error: error.response?.data?.message || "This section could not be loaded.",
                data: null,
              },
            }));
          }
        };

        if (currentProfile.role === "admin") {
          void loadSection("adminSummary", getMyAdminSummary);
        } else {
          void Promise.all([
            loadSection("risk", getMyRiskAssessment),
            loadSection("quizzes", getMyAssignedQuizzes),
            loadSection("results", getMyQuizResultsForProfile),
            loadSection("trainings", getMyTrainings),
            loadSection("trainingProgress", getMyTrainingProgress),
            loadSection("phishing", getMyPhishingHistory),
            loadSection("recommendations", getMyTopRecommendations),
          ]);
        }
      } catch (error) {
        if (active) setProfileError(error.response?.data?.message || "Unable to load your profile.");
      } finally {
        if (active) setLoadingProfile(false);
      }
    };
    void loadProfile();
    return () => { active = false; };
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileMessage("");
    try {
      const updated = await updateMyProfile(profileForm);
      setProfile(updated);
      setProfileForm({
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        designation: updated.designation || "",
        profileImage: updated.profileImage || "",
      });
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...storedUser,
        firstName: updated.firstName,
        lastName: updated.lastName,
        profileImage: updated.profileImage,
      }));
      setProfileMessage("Your profile details were saved.");
    } catch (error) {
      setProfileError(error.response?.data?.message || "Unable to save your profile details.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setChangingPassword(true);
    setPasswordError("");
    setPasswordMessage("");
    try {
      const response = await changeMyPassword(passwordForm);
      setPasswordMessage(response.data?.message || "Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Unable to change your password.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loadingProfile) return <section className="profile-page"><p role="status" className="profile-state">Loading your profile...</p></section>;
  if (!profile) return <section className="profile-page"><p role="alert" className="profile-error">{profileError || "Unable to load your profile."}</p></section>;

  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User";
  const risk = sections.risk.data;
  const assignedQuizzes = sections.quizzes.data || [];
  const quizResults = sections.results.data || [];
  const attemptedQuizIds = new Set(quizResults.map((result) => getId(result.quizId)));
  const pendingQuizzes = assignedQuizzes.filter((quiz) => !attemptedQuizIds.has(getId(quiz._id)));
  const overdueQuizzes = pendingQuizzes.filter((quiz) => quiz.dueDate && new Date(quiz.dueDate).getTime() < Date.now());
  const quizScores = quizResults.map(getQuizScore).filter(Number.isFinite);
  const averageQuizScore = quizScores.length ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length : null;
  const trainings = sections.trainings.data || [];
  const trainingProgress = sections.trainingProgress.data || [];
  const progressByTraining = new Map(trainingProgress.map((record) => [getId(record.trainingId), record]));
  const trainingCounts = { completed: 0, inProgress: 0, notStarted: 0 };
  trainings.forEach((training) => {
    const record = progressByTraining.get(getId(training._id));
    if (record?.completed) trainingCounts.completed += 1;
    else if (record && (record.progress > 0 || record.openedLessons?.length || record.completedLessons?.length || record.knowledgeCheckAttempts)) trainingCounts.inProgress += 1;
    else trainingCounts.notStarted += 1;
  });
  const phishingAttempts = sections.phishing.data || [];
  const recommendations = sections.recommendations.data || [];

  return (
    <section className="profile-page">
      <header className="profile-page-header">
        <div><p className="section-kicker">Account</p><h1>My Profile</h1><p>Manage your account details and review your {isAdmin ? "administrator summary" : "personal security activity"}.</p></div>
      </header>

      {profileError && <p role="alert" className="profile-error">{profileError}</p>}
      {profileMessage && <p role="status" className="profile-success">{profileMessage}</p>}

      <article className="profile-account-panel">
        <div className="profile-large-avatar" aria-label={`${fullName} avatar`}>
          <span>{getInitials(profile)}</span>
          {profile.profileImage && <img src={profile.profileImage} alt="" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
        </div>
        <div className="profile-account-copy">
          <h2>{fullName}</h2><p>{profile.email}</p>
          <div className="profile-account-tags"><span>{profile.role}</span><span>{profile.status}</span></div>
        </div>
        <dl className="profile-account-details">
          <div><dt>Department</dt><dd>{profile.departmentId?.departmentName || "Unassigned"}</dd></div>
          <div><dt>Designation</dt><dd>{profile.designation || "Not set"}</dd></div>
          <div><dt>Member since</dt><dd>{formatDate(profile.createdAt)}</dd></div>
        </dl>
      </article>

      <div className="profile-forms-grid">
        <article className="profile-panel">
          <h2>Edit my details</h2><p className="profile-panel-copy">Email, role, department, status, and performance data are managed separately.</p>
          <form onSubmit={saveProfile} className="profile-form">
            <label><span>First name</span><input required maxLength={80} value={profileForm.firstName} onChange={(event) => setProfileForm({ ...profileForm, firstName: event.target.value })} /></label>
            <label><span>Last name</span><input required maxLength={80} value={profileForm.lastName} onChange={(event) => setProfileForm({ ...profileForm, lastName: event.target.value })} /></label>
            <label><span>Designation</span><input maxLength={120} value={profileForm.designation} onChange={(event) => setProfileForm({ ...profileForm, designation: event.target.value })} /></label>
            <label className="profile-form-wide"><span>Profile image URL</span><input type="url" maxLength={2048} placeholder="https://example.com/photo.jpg" value={profileForm.profileImage} onChange={(event) => setProfileForm({ ...profileForm, profileImage: event.target.value })} /></label>
            <button type="submit" disabled={savingProfile}>{savingProfile ? "Saving..." : "Save details"}</button>
          </form>
        </article>

        <article className="profile-panel">
          <h2>Change password</h2><p className="profile-panel-copy">Use at least 12 characters with uppercase, lowercase, a number, and a symbol.</p>
          {passwordError && <p role="alert" className="profile-error">{passwordError}</p>}
          {passwordMessage && <p role="status" className="profile-success">{passwordMessage}</p>}
          <form onSubmit={savePassword} className="profile-form">
            <label className="profile-form-wide"><span>Current password</span><input type="password" autoComplete="current-password" required value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} /></label>
            <label><span>New password</span><input type="password" autoComplete="new-password" minLength={12} required value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} /></label>
            <label><span>Confirm new password</span><input type="password" autoComplete="new-password" minLength={12} required value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} /></label>
            <button type="submit" disabled={changingPassword}>{changingPassword ? "Changing..." : "Change password"}</button>
          </form>
        </article>
      </div>

      {isAdmin ? (
        <ProfileSection title="Admin summary" section={sections.adminSummary}>
          {sections.adminSummary.data && <div className="profile-summary-grid"><SummaryValue label="Total employees" value={sections.adminSummary.data.totalEmployees} /><SummaryValue label="Active campaigns" value={sections.adminSummary.data.activeCampaigns} /><SummaryValue label="Unread notifications" value={sections.adminSummary.data.unreadNotifications} /></div>}
        </ProfileSection>
      ) : (
        <>
          <ProfileSection title="Human Risk Score" section={sections.risk}>
            {risk && Number.isFinite(risk.finalRiskScore) ? <div className="profile-risk-value"><strong>{risk.finalRiskScore}</strong><span>{risk.riskLevel}</span></div> : <p>Not assessed yet.</p>}
          </ProfileSection>

          <ProfileSection title="Quiz performance" section={{ loading: sections.quizzes.loading || sections.results.loading, error: sections.quizzes.error || sections.results.error }}>
            {assignedQuizzes.length === 0 && quizResults.length === 0 ? <p>No quiz activity yet.</p> : <>
              <div className="profile-summary-grid"><SummaryValue label="Quizzes taken" value={quizResults.length} /><SummaryValue label="Average score" value={formatPercent(averageQuizScore)} /><SummaryValue label="Pending" value={pendingQuizzes.length} /><SummaryValue label="Overdue" value={overdueQuizzes.length} /></div>
              {quizResults.length > 0 && <ul className="profile-record-list">{quizResults.slice(0, 8).map((result) => <li key={result._id}><span>{result.quizId?.title || "Quiz"}</span><strong>{formatPercent(getQuizScore(result))}</strong></li>)}</ul>}
              {pendingQuizzes.length > 0 && <div className="profile-pending-list"><h3>Pending and overdue quizzes</h3>{pendingQuizzes.map((quiz) => <p key={quiz._id}><Link to={`/quiz/${quiz._id}`}>{quiz.title}</Link>{quiz.dueDate && <span>{new Date(quiz.dueDate) < new Date() ? "Overdue" : `Due ${formatDate(quiz.dueDate)}`}</span>}</p>)}</div>}
            </>}
          </ProfileSection>

          <ProfileSection title="Training progress" section={{ loading: sections.trainings.loading || sections.trainingProgress.loading, error: sections.trainings.error || sections.trainingProgress.error }}>
            {trainings.length === 0 ? <p>No training courses are available yet.</p> : <>
              <div className="profile-summary-grid"><SummaryValue label="Completed" value={trainingCounts.completed} /><SummaryValue label="In progress" value={trainingCounts.inProgress} /><SummaryValue label="Not started" value={trainingCounts.notStarted} /></div>
              <ul className="profile-record-list">{trainings.map((training) => {
                const progress = progressByTraining.get(getId(training._id));
                return <li key={training._id}><span><Link to={`/training?trainingId=${training._id}`}>{training.title}</Link></span><strong>{progress?.completed ? "Completed" : `${progress?.progress || 0}%`}</strong></li>;
              })}</ul>
            </>}
          </ProfileSection>

          <ProfileSection title="Phishing simulation history" section={sections.phishing}>
            {phishingAttempts.length === 0 ? <p>No phishing simulation records yet.</p> : <>
              <div className="profile-summary-grid"><SummaryValue label="Sent" value={phishingAttempts.length} /><SummaryValue label="Opened" value={phishingAttempts.filter((attempt) => attempt.emailOpened).length} /><SummaryValue label="Clicked" value={phishingAttempts.filter((attempt) => attempt.clicked || attempt.linkClicked).length} /><SummaryValue label="Reported" value={phishingAttempts.filter((attempt) => attempt.reported).length} /></div>
              <ul className="profile-record-list">{phishingAttempts.slice(0, 5).map((attempt) => <li key={attempt._id}><span>{attempt.campaignId?.title || "Simulation"} · {formatDate(attempt.sentAt)}</span><strong>{attempt.reported ? "Reported" : attempt.clicked || attempt.linkClicked ? "Clicked" : attempt.emailOpened ? "Opened" : "No response"}</strong></li>)}</ul>
            </>}
          </ProfileSection>

          <ProfileSection title="Top recommendations" section={sections.recommendations}>
            {recommendations.length === 0 ? <p>You're all caught up.</p> : <><ul className="profile-record-list">{recommendations.slice(0, 3).map((recommendation) => <li key={recommendation._id}><Link to="/recommendations">{recommendation.title}</Link><strong>{recommendation.priority}</strong></li>)}</ul><Link className="profile-more-link" to="/recommendations">View all my recommendations</Link></>}
          </ProfileSection>
        </>
      )}
    </section>
  );
};

const ProfileSection = ({ title, section, children }) => (
  <article className="profile-panel profile-data-panel">
    <h2>{title}</h2>
    {section.loading ? <p className="profile-muted">Loading {title.toLowerCase()}...</p> : section.error ? <p role="alert" className="profile-section-error">{section.error}</p> : children}
  </article>
);

const SummaryValue = ({ label, value }) => (
  <div className="profile-summary-value"><span>{label}</span><strong>{value ?? "Not available"}</strong></div>
);

export default Profile;
