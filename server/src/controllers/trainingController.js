const Training = require("../models/Training");

exports.getTrainings = async (req, res, next) => {
	try {
		const trainings = await Training.find()
			.select("_id title description category type resourceURL duration")
			.sort({ createdAt: 1 });

		res.status(200).json({
			success: true,
			data: trainings,
		});
	} catch (err) {
		next(err);
	}
};
