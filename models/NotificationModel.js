export default {
    setupUserNotification: async (userId, language, categories, playerId) => {
        try {
            const news = await CategoryModel.getLatestCategoryNewsForUser(
                language,
                categories
            )
            const message = {
                app_id: process.env.ONE_SIGNAL_APP_ID,
                contents: { en: news.headline },
                headings: { en: "News Shield" },
                include_player_ids: playerId,
                data: {
                    id: news._id
                },
                big_picture: news.imgixUrlHighRes,
                ios_attachments: {
                    id: news.imgixUrlHighRes
                },
                content_available: true
            }
            try {
                await OneSignalModel.sendNotification(message)
            } catch (error) {}
            return
        } catch (error) {
            throw error
        }
    }
}
