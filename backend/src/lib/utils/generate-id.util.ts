import { Model } from 'mongoose';

// ✅ In-memory lock to prevent race conditions
const locks = new Map<string, Promise<string>>();


export async function generateNextId(
    model: Model<any>,
    fieldName: string,
    prefix: string,
    padding: number = 5,
): Promise<string> {
    const lockKey = `${model.modelName}-${fieldName}`;

    // ✅ Wait for existing lock if one exists
    while (locks.has(lockKey)) {
        await locks.get(lockKey);
    }

    // ✅ Create new lock
    const promise = (async () => {
        try {
            // ✅ Find the highest existing ID
            const lastRecord = await model
                .findOne({}, { [fieldName]: 1 })
                .sort({ [fieldName]: -1 })
                .lean()
                .exec();

            let nextNumber = 1;

            if (lastRecord && lastRecord[fieldName]) {
                // Extract number from ID (e.g., "FGD-00123" -> 123)
                const currentId = lastRecord[fieldName] as string;
                const match = currentId.match(/\d+$/);

                if (match) {
                    nextNumber = parseInt(match[0], 10) + 1;
                }
            }

            // ✅ Generate new ID with padding
            const paddedNumber = String(nextNumber).padStart(padding, '0');
            return `${prefix}-${paddedNumber}`;

        } finally {
            // ✅ Release lock
            locks.delete(lockKey);
        }
    })();

    locks.set(lockKey, promise);
    return promise;
}
