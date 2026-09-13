const PhishingAwarenessResult = require("../models/PhishingAwarenessResult");

const getValidatedResultInput = (body) => {
  const { totalScenarios, correctAnswers } = body;

  if (
    !Number.isInteger(totalScenarios) ||
    totalScenarios < 1 ||
    !Number.isInteger(correctAnswers) ||
    correctAnswers < 0 ||
    correctAnswers > totalScenarios
  ) {
    return null;
  }

  return { totalScenarios, correctAnswers };
};

exports.submitAwarenessResult = async (req, res, next) => {
  try {
    const input = getValidatedResultInput(req.body);

    if (!input) {
      return res.status(400).json({
        success: false,
        message: "Invalid phishing awareness result.",
      });
    }

    const score = Math.round(
      (input.correctAnswers / input.totalScenarios) * 100
    );
    const result = await PhishingAwarenessResult.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          userId: req.user._id,
          totalScenarios: input.totalScenarios,
          correctAnswers: input.correctAnswers,
          score,
          completedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).select("totalScenarios correctAnswers score completedAt");

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAwarenessResult = async (req, res, next) => {
  try {
    const result = await PhishingAwarenessResult.findOne({
      userId: req.user._id,
    }).select("totalScenarios correctAnswers score completedAt");

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
