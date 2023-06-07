export default {
    getLatestCategoryNewsForUser: async (language, categories) => {
        try {
            const latestCategoriesNews = await News.aggregate([
                {
                    $match: {
                        status: "ready",
                        categories: {
                            $in: categories
                        },
                        language: mongoose.Types.ObjectId(language)
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $limit: 1
                },
                {
                    $project: {
                        _id: 1,
                        headline: 1,
                        summary: 1,
                        imgixUrlHighRes: 1
                    }
                }
            ])
            return latestCategoriesNews[0]
        } catch (error) {
            throw error
        }
    }
}
