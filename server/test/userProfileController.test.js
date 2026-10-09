const test = require("node:test");
const assert = require("node:assert/strict");
const User = require("../src/models/User");
const PhishingCampaign = require("../src/models/PhishingCampaign");
const Notification = require("../src/models/Notification");
const controller = require("../src/controllers/userController");
const userRouter = require("../src/routes/userRoutes");

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("self-profile updates reject role, department, email, and status fields", async () => {
  const original = User.findByIdAndUpdate;
  let writeCalled = false;
  User.findByIdAndUpdate = () => { writeCalled = true; };
  try {
    const response = createResponse();
    await controller.updateMyProfile({ user: { _id: "jwt-user" }, body: { firstName: "Ada", role: "admin" } }, response, (error) => { throw error; });
    assert.equal(response.statusCode, 400);
    assert.equal(writeCalled, false);
  } finally {
    User.findByIdAndUpdate = original;
  }
});

test("self-profile writes use only the authenticated user ID and return a safe user object", async () => {
  const original = User.findByIdAndUpdate;
  let filter;
  let update;
  const safeUser = { _id: "jwt-user", firstName: "Ada", lastName: "Lovelace", email: "ada@example.test", role: "employee" };
  User.findByIdAndUpdate = (query, changes) => {
    filter = query;
    update = changes;
    return {
      select() { return this; },
      populate: async () => safeUser,
    };
  };
  try {
    const response = createResponse();
    await controller.updateMyProfile({
      user: { _id: "jwt-user" },
      params: { id: "other-user" },
      body: { firstName: " Ada ", lastName: "Lovelace", designation: "Engineer", profileImage: "https://images.example.test/ada.jpg" },
    }, response, (error) => { throw error; });
    assert.deepEqual(filter, "jwt-user");
    assert.deepEqual(update, { firstName: "Ada", lastName: "Lovelace", designation: "Engineer", profileImage: "https://images.example.test/ada.jpg" });
    assert.equal(response.statusCode, 200);
    assert.equal(Object.hasOwn(response.body.data, "passwordHash"), false);
  } finally {
    User.findByIdAndUpdate = original;
  }
});

test("password changes verify current password, enforce strength, save via the model hook, and never return hashes", async () => {
  const original = User.findById;
  let savedPassword;
  const user = {
    passwordHash: "existing-hash",
    async comparePassword(candidate) {
      if (candidate === "CorrectCurrent!9") return true;
      if (candidate === "Weak-current-test") return true;
      return false;
    },
    async save() { savedPassword = this.passwordHash; },
  };
  User.findById = () => ({ select: async () => user });
  try {
    const weakResponse = createResponse();
    await controller.changeMyPassword({
      user: { _id: "jwt-user" },
      body: { currentPassword: "CorrectCurrent!9", newPassword: "weak", confirmPassword: "weak" },
    }, weakResponse, (error) => { throw error; });
    assert.equal(weakResponse.statusCode, 400);
    assert.equal(savedPassword, undefined);

    const response = createResponse();
    await controller.changeMyPassword({
      user: { _id: "jwt-user" },
      body: { currentPassword: "CorrectCurrent!9", newPassword: "NewStrongPassword!9", confirmPassword: "NewStrongPassword!9", role: "admin" },
    }, response, (error) => { throw error; });
    assert.equal(response.statusCode, 400);
    assert.equal(savedPassword, undefined);

    const successfulResponse = createResponse();
    await controller.changeMyPassword({
      user: { _id: "jwt-user" },
      body: { currentPassword: "CorrectCurrent!9", newPassword: "NewStrongPassword!9", confirmPassword: "NewStrongPassword!9" },
    }, successfulResponse, (error) => { throw error; });
    assert.equal(response.statusCode, 400);
    assert.equal(successfulResponse.statusCode, 200);
    assert.equal(savedPassword, "NewStrongPassword!9");
    assert.equal(Object.hasOwn(successfulResponse.body, "passwordHash"), false);
  } finally {
    User.findById = original;
  }
});

test("admin summary is unavailable to employee users", async () => {
  const original = {
    userCount: User.countDocuments,
    campaignCount: PhishingCampaign.countDocuments,
    notificationCount: Notification.countDocuments,
  };
  let countCalled = false;
  User.countDocuments = async () => { countCalled = true; return 0; };
  PhishingCampaign.countDocuments = User.countDocuments;
  Notification.countDocuments = User.countDocuments;
  try {
    const response = createResponse();
    await controller.getMyAdminSummary({ user: { _id: "employee-id", role: "employee" } }, response, (error) => { throw error; });
    assert.equal(response.statusCode, 403);
    assert.equal(countCalled, false);
  } finally {
    User.countDocuments = original.userCount;
    PhishingCampaign.countDocuments = original.campaignCount;
    Notification.countDocuments = original.notificationCount;
  }
});

test("self routes use protect and the admin summary adds the admin role guard", () => {
  const profileRoute = userRouter.stack.find((layer) => layer.route?.path === "/me" && layer.route.methods.get);
  const updateRoute = userRouter.stack.find((layer) => layer.route?.path === "/me" && layer.route.methods.patch);
  const passwordRoute = userRouter.stack.find((layer) => layer.route?.path === "/me/password");
  const summaryRoute = userRouter.stack.find((layer) => layer.route?.path === "/me/admin-summary");
  assert.ok(profileRoute && updateRoute && passwordRoute && summaryRoute);
  [profileRoute, updateRoute, passwordRoute, summaryRoute].forEach((route) => {
    const response = createResponse();
    route.route.stack[0].handle({ headers: {} }, response, () => assert.fail("unauthenticated request passed protect"));
    assert.equal(response.statusCode, 401);
  });
  const response = createResponse();
  summaryRoute.route.stack[1].handle({ user: { role: "employee" } }, response, () => assert.fail("employee passed admin guard"));
  assert.equal(response.statusCode, 403);
});