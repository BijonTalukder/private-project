export default () => ({
    app: {
        env: process.env.NODE_ENV,
        port: parseInt(process.env.PORT || '3000', 10),
    },

    database: {
        mongoUri: process.env.MONGO_URI,
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
});
