import { Checkbox } from "antd";
import { Controller, useFormContext } from "react-hook-form";

interface IFormCheckbox {
    name: string;
    label?: string;
    validation?: any;
}

const FormCheckbox = ({ name, label, validation }: IFormCheckbox) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const error = errors?.[name]?.message as string | undefined;

    return (
        <div style={{ marginBottom: 16 }}>
            <Controller
                name={name}
                control={control}
                rules={validation}
                render={({ field }) => (
                    <Checkbox {...field} checked={field.value}>
                        {label}
                    </Checkbox>
                )}
            />

            {error && <small style={{ color: "red" }}>{error}</small>}
        </div>
    );
};

export default FormCheckbox;
