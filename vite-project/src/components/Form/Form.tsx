
import { FormProvider, useForm } from "react-hook-form";

import type { ReactNode } from "react";
import type {
    SubmitHandler,
    UseFormProps,
    FieldValues,
} from "react-hook-form";

interface FormProps<T extends FieldValues>
    extends UseFormProps<T> {
    children: ReactNode;
    onSubmit: SubmitHandler<T>;
    resetOnSubmit?: boolean;
}

const Form = <T extends FieldValues>({
    children,
    onSubmit,
    defaultValues,
    resolver,
    resetOnSubmit = false,
}: FormProps<T>) => {
    const methods = useForm<T>({
        defaultValues,
        resolver,
    });

    const { handleSubmit, reset } = methods;

    const submitHandler: SubmitHandler<T> = (data) => {
        onSubmit(data);
        if (resetOnSubmit) {
            reset();
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(submitHandler)}>
                {children}
            </form>
        </FormProvider>
    );
};

export default Form;
