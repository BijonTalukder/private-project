import { Input } from "antd";
import { Controller, useFormContext } from "react-hook-form";

interface IInput {
    name: string;
    type?: string;
    size?: "large" | "small";
    placeholder?: string;
    validation?: any;
    label?: string;
    required?: boolean;
}

const FormInput = ({
    name,
    type = "text",
    size = "large",
    placeholder,
    validation,
    label,
    required,
}: IInput) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const error = errors?.[name]?.message as string | undefined;

    return (
        <div style={{ marginBottom: "16px" }}>
            {label && (
                <label>
                    {label} {required && <span style={{ color: "red" }}>*</span>}
                </label>
            )}

            <Controller
                name={name}
                control={control}
                rules={validation}
                render={({ field }) =>
                    type === "password" ? (
                        <Input.Password
                            {...field}
                            size={size}
                            placeholder={placeholder}
                            status={error ? "error" : ""}
                        />
                    ) : (
                        <Input
                            {...field}
                            type={type}
                            size={size}
                            placeholder={placeholder}
                            status={error ? "error" : ""}
                        />
                    )
                }
            />

            {error && (
                <small style={{ color: "red" }}>
                    {error}
                </small>
            )}
        </div>
    );
};

export default FormInput;
