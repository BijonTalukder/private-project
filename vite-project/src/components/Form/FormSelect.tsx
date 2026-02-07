import { Select } from "antd";
import { Controller, useFormContext } from "react-hook-form";

interface IOption {
    label: string;
    value: string | number;
}

interface IFormSelect {
    name: string;
    label?: string;
    options: IOption[];
    placeholder?: string;
    mode?: "multiple" | "tags";
    validation?: any;
}

const FormSelect = ({
    name,
    label,
    options,
    placeholder,
    mode,
    validation,
}: IFormSelect) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const error = errors?.[name]?.message as string | undefined;

    return (
        <div style={{ marginBottom: 16 }}>
            {label && <label>{label}</label>}

            <Controller
                name={name}
                control={control}
                rules={validation}
                render={({ field }) => (
                    <Select
                        {...field}
                        mode={mode}
                        options={options}
                        placeholder={placeholder}
                        style={{ width: "100%" }}
                        status={error ? "error" : ""}
                    />
                )}
            />

            {error && <small style={{ color: "red" }}>{error}</small>}
        </div>
    );
};

export default FormSelect;
