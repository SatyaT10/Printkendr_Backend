module.exports = {
    apps: [
        {
            name: "Sarver",
            script: "index.js",
            watch: true, // Enable watch mode
            ignore_watch: ["node_modules", "logs", "CategoryImage", "ProductImage"], // Ignore these directories
        },
    ],
};