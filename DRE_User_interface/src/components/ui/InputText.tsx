import { ChangeEvent, DetailedHTMLProps, InputHTMLAttributes } from "react";

interface Props
  extends Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    "onChange"
  > {
  onChange: (v: string, e: ChangeEvent<HTMLInputElement>) => void;
}

export const InputText = (props: Props) => {
  const { onChange } = props;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value, e);
  };

  return (
    <input {...props} className="rounded border p-2" onChange={handleChange} />
  );
};
