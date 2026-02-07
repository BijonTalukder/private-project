export const getBcryptSaltRounds = (): number => {
    const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);

    if (isNaN(rounds) || rounds < 8) {
        throw new Error('Invalid BCRYPT_SALT_ROUNDS value');
    }

    return rounds;
};
