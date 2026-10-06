const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");

const canAccessQuiz = (quiz, user) => {
  if (!quiz || !user) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  const userId = String(user._id);
  const departmentId = user.departmentId ? String(user.departmentId) : null;

  return Boolean(
    quiz.targetAll ||
      quiz.targetUsers?.some((targetId) => String(targetId) === userId) ||
      (departmentId &&
        quiz.targetDepartments?.some(
          (targetId) => String(targetId) === departmentId
        ))
  );
};

const findAccessibleQuiz = async (quizId, user) => {
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    return null;
  }

  const quiz = await Quiz.findById(quizId).lean();
  return canAccessQuiz(quiz, user) ? quiz : null;
};

module.exports = { canAccessQuiz, findAccessibleQuiz };