"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
  useWatch,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

import { FieldError } from "@repo/design-system/components/field";
import { cn } from "@repo/design-system/lib/utils";

/** RHF FormProvider alias — compose Field* layout inside FormField render. */
const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  id: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null
);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  const id = React.useId();

  return (
    <FormFieldContext.Provider value={{ name: props.name, id }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext?.name });

  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = fieldContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: id,
    formDescriptionId: `${id}-description`,
    formMessageId: `${id}-message`,
    ...fieldState,
  };
}

type FormControlProps = {
  children: React.ReactElement;
};

/**
 * Slots a11y props onto a single child control (Input, SelectTrigger, …).
 * Prefer wrapping the focusable control, not the composite Root.
 */
function FormControl({ children }: FormControlProps) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return React.cloneElement(children, {
    id: formItemId,
    "aria-describedby": error
      ? `${formDescriptionId} ${formMessageId}`
      : formDescriptionId,
    "aria-invalid": !!error || undefined,
  } as Record<string, unknown>);
}

function FormMessage({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactNode {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : null;

  if (!body) {
    return null;
  }

  return (
    <FieldError
      id={formMessageId}
      className={cn(className)}
      {...props}
    >
      {body}
    </FieldError>
  );
}

export {
  Form,
  FormControl,
  FormField,
  FormMessage,
  useForm,
  useFormContext,
  useFormField,
  useWatch,
  zodResolver,
  type UseFormReturn,
};
