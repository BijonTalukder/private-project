export const generateSerial = async (
    model: any,
    prefix: string,
    fieldName: string
): Promise<string> => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const datePart = `${yyyy}${mm}${dd}`;

    // ✅ Find the last document whose serial starts with today's prefix
    // Sorting by fieldName descending gives us the highest serial of today
    const last = await model
        .findOne({ [fieldName]: { $regex: `^${prefix}-${datePart}-` } })
        .sort({ [fieldName]: -1 })
        .select(fieldName)
        .lean();

    let nextNumber = 1;

    if (last) {
        // Extract the numeric part from e.g. "INV-20260307-0012" → 12
        const parts = last[fieldName]?.split("-") ?? [];
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1;
        }
    }

    const serial = String(nextNumber).padStart(4, "0");
    return `${prefix}-${datePart}-${serial}`;
};