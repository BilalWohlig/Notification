import DailyNotification from "../mongooseModel/DailyNotification"

export default {
    updateDailyNotification: async (userId) => {
        try {
            const data = await DailyNotification.findOneAndUpdate(
                {
                    userId: userId,
                    createdAt: {
                        $gte: new Date(moment().startOf("day").format())
                    }
                },
                {
                    userId: userId,
                    $inc: { notificationCount: 1 },
                    notificationSentTime: Date.now()
                },
                { upsert: true, new: true }
            )
            return data
        } catch (error) {
            throw error
        }
    }
}
