import { Radio } from "antd";
import { Controller, useFormContext } from "react-hook-form";

interface IOption {
    label: string;
    value: string | number;
}

interface IFormRadio {
    name: string;
    label?: string;
    options: IOption[];
    validation?: any;
}

const FormRadio = ({ name, label, options, validation }: IFormRadio) => {
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
                    <Radio.Group {...field}>
                        {options.map((opt) => (
                            <Radio key={opt.value} value={opt.value}>
                                {opt.label}
                            </Radio>
                        ))}
                    </Radio.Group>
                )}
            />

            {error && <small style={{ color: "red" }}>{error}</small>}
        </div>
    );
};

export default FormRadio;
