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

    const start = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
    const end = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`);

    const count = await model.countDocuments({
        createdAt: { $gte: start, $lte: end },
    });

    const serial = String(count + 1).padStart(4, "0");

    return `${prefix}-${datePart}-${serial}`;
};