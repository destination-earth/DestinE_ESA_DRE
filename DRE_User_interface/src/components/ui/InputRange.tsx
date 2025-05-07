import { ChangeEvent, DetailedHTMLProps, InputHTMLAttributes } from "react";

interface Props
  extends Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    "onChange"
  > {
  onChange: (v: number) => void;
  min: number;
  max: number;
}

export const InputRange = (props: Props) => {
  const { onChange, min, max } = props;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(Number(e.target.value));
  };

  return (
    <input
      {...props}
      type="range"
      min={min}
      max={max}
      onChange={handleChange}
    />
  );
};
