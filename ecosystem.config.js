module.exports = {
    apps: [
        {
            name: "Printkendr",
            script: "index.js",
            watch: true, // Enable watch mode
            ignore_watch: ["node_modules", "logs", "orderFile", "Images"], // Ignore these directories
        },
    ],
};