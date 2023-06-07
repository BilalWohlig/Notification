/**
 * Add Cron Here. Refer https://www.npmjs.com/package/node-cron
 * cron.schedule('* * * * *', () => {
 * console.log('running a task every minute')
 * });
 */

if (process.env.notificationCron) {
    console.log("notification cron are active")
    cron.schedule("0 * * * *", async () => {
        console.log(
            "Running Notification Cron Every 1 Hour",
            new Date().toLocaleString()
        )
        const notificationUsers = await Notification.find({
            status: "enabled"
        })
            .populate("userId", "playerId language categories status")
            .exec()
        console.log("Number of Users:", notificationUsers.length)
        for (let user of notificationUsers) {
            try {
                if (
                    user &&
                    user.userId &&
                    user.userId.status == "enabled" &&
                    user.userId.categories &&
                    user.userId.categories.length > 0 &&
                    user.userId.playerId &&
                    user.userId.playerId.length > 0 &&
                    user.userId.language
                ) {
                    console.log("Checking for Notifications", user)
                    const todaysNotifications =
                        await DailyNotification.aggregate([
                            {
                                $match: {
                                    userId: mongoose.Types.ObjectId(
                                        user.userId._id
                                    ),
                                    createdAt: {
                                        $gte: new Date(
                                            moment().startOf("day").format()
                                        )
                                    }
                                }
                            },
                            {
                                $sort: {
                                    createdAt: -1
                                }
                            },
                            {
                                $limit: 1
                            }
                        ])
                    if (todaysNotifications.length > 0) {
                        const lastNotification = todaysNotifications[0]
                        if (
                            lastNotification.notificationCount >=
                            user.dailyCount
                        ) {
                            console.log("limit exceeded")
                            continue
                        } else {
                            if (
                                lastNotification.notificationSentTime &&
                                lastNotification.notificationSentTime >=
                                    new Date(
                                        moment()
                                            .subtract(
                                                Math.floor(
                                                    24 / user.dailyCount
                                                ),
                                                "h"
                                            )
                                            .add(15, "m")
                                            .format()
                                    )
                            ) {
                                console.log("Not this time")
                                continue
                            }
                            console.log("Sending notification... right now")
                            await NotificationModel.setupUserNotification(
                                user.userId._id,
                                user.userId.language,
                                user.userId.categories,
                                user.userId.playerId
                            )
                            await DailyNotificationModel.updateDailyNotification(
                                user.userId._id
                            )
                        }
                    } else {
                        console.log("First time sending notifiacation in a day")
                        await NotificationModel.setupUserNotification(
                            user.userId._id,
                            user.userId.language,
                            user.userId.categories,
                            user.userId.playerId
                        )
                        await DailyNotificationModel.updateDailyNotification(
                            user.userId._id
                        )
                    }
                }
            } catch (error) {
                console.error(error.message)
            }
        }
        console.log("Notification cron ended", new Date().toLocaleString())
    })
}
