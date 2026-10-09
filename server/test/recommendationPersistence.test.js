const test = require("node:test");
const assert = require("node:assert/strict");
const Recommendation = require("../src/models/Recommendation");
const { synchronizeRecommendations } = require("../src/services/recommendationService");

test("recommendation synchronization deduplicates, resolves cleared rules, and reactivates recurring rules", async () => {
  const originalMethods = {
    findOne: Recommendation.findOne,
    findOneAndUpdate: Recommendation.findOneAndUpdate,
    updateMany: Recommendation.updateMany,
    find: Recommendation.find,
  };
  const records = [];

  Recommendation.findOne = (filter) => ({
    lean: async () => records.find((record) => record.recommendationKey === filter.recommendationKey) || null,
  });
  Recommendation.findOneAndUpdate = async (filter, update, options = {}) => {
    let record = records.find((item) => item.recommendationKey === filter.recommendationKey);
    if (!record && options.upsert) {
      record = { _id: "recommendation-1", createdAt: new Date(), ...update.$set };
      records.push(record);
    } else if (record) {
      Object.assign(record, update.$set);
    }
    return record;
  };
  Recommendation.updateMany = async (filter, update) => {
    records.forEach((record) => {
      const inScope = record.audience === filter.audience &&
        (!filter.userId || String(record.userId) === String(filter.userId));
      const isActive = filter.status.$in.includes(record.status);
      const remainsCurrent = filter.recommendationKey.$nin.includes(record.recommendationKey);
      if (inScope && isActive && !remainsCurrent) Object.assign(record, update.$set);
    });
  };
  Recommendation.find = (filter) => {
    const query = {
      populate() { return this; },
      lean: async () => records.filter((record) =>
        record.audience === filter.audience &&
        (!filter.userId || String(record.userId) === String(filter.userId)) &&
        filter.status.$in.includes(record.status)
      ),
    };
    return query;
  };

  const item = {
    recommendationKey: "employee:user-1:quiz:quiz-1",
    audience: "employee",
    userId: "user-1",
    recommendationType: "quiz-remaining",
    title: "Complete assigned quiz",
    priority: "remaining",
  };

  try {
    assert.equal((await synchronizeRecommendations([item], "employee", "user-1")).length, 1);
    assert.equal((await synchronizeRecommendations([item], "employee", "user-1")).length, 1);
    assert.equal(records.length, 1);

    assert.equal((await synchronizeRecommendations([], "employee", "user-1")).length, 0);
    assert.equal(records[0].status, "resolved");
    assert.ok(records[0].resolvedAt instanceof Date);

    assert.equal((await synchronizeRecommendations([item], "employee", "user-1")).length, 1);
    assert.equal(records.length, 1);
    assert.equal(records[0].status, "pending");
    assert.ok(records[0].unresolvedSince instanceof Date);
  } finally {
    Object.assign(Recommendation, originalMethods);
  }
});