export default {
    sendNotification: async (data) => {
        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Basic ${process.env.ONE_SIGNAL_API_KEY}`
        }

        const options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers
        }

        const https = require("https")

        const req = https.request(options)

        req.write(JSON.stringify(data))
        req.end()

        return new Promise((resolve, reject) => {
            req.on("response", (res) => {
                res.setEncoding("utf8")
                let responseBody = ""
                res.on("data", (chunk) => {
                    responseBody += chunk
                })
                res.on("end", () => {
                    const response = JSON.parse(responseBody)
                    if (response.errors) {
                        reject(response.errors)
                    } else {
                        resolve(response)
                    }
                })
            })

            req.on("error", (e) => {
                reject(e)
            })
        })
    }
}
