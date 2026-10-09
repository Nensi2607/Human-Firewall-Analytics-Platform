const test = require("node:test");
const assert = require("node:assert/strict");
const router = require("../src/routes/recommendationRoutes");
const controller = require("../src/controllers/recommendationController");
const recommendationService = require("../src/services/recommendationService");

test("an employee receives 403 from the admin recommendation route", () => {
  const route = router.stack.find((layer) => layer.route?.path === "/admin");
  assert.ok(route);
  const adminAuthorization = route.route.stack[1].handle;
  let statusCode;
  let responseBody;
  let nextCalled = false;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  adminAuthorization({ user: { role: "employee" } }, response, () => { nextCalled = true; });

  assert.equal(statusCode, 403);
  assert.equal(responseBody.success, false);
  assert.equal(nextCalled, false);
});

test("the employee recommendations endpoint passes only the JWT caller to generation", async () => {
  const original = recommendationService.getEmployeeRecommendations;
  let receivedEmployee;
  recommendationService.getEmployeeRecommendations = async (employee) => {
    receivedEmployee = employee;
    return [];
  };
  const response = {
    status() { return this; },
    json(body) { this.body = body; return this; },
  };
  const caller = { _id: "jwt-employee-id", role: "employee" };

  try {
    await controller.getMyRecommendations({
      user: caller,
      query: { employeeId: "other-employee-id" },
    }, response, (error) => { throw error; });
    assert.equal(receivedEmployee, caller);
    assert.deepEqual(response.body.data, []);
  } finally {
    recommendationService.getEmployeeRecommendations = original;
  }
});