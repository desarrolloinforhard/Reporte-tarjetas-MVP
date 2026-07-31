import { TextInputProps } from 'react-native';

import { TextField } from '@/components/ui/text-field';
import { formatAmountFilterInput } from '@/utils/amount-filter';

type AmountFieldProps = Omit<TextInputProps, 'keyboardType' | 'onChangeText' | 'value'> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
};

export function AmountField({ label, onChangeText, value, ...props }: AmountFieldProps) {
  return (
    <TextField
      {...props}
      keyboardType="decimal-pad"
      label={label}
      onChangeText={(nextValue) => onChangeText(formatAmountFilterInput(nextValue))}
      value={formatAmountFilterInput(value)}
    />
  );
}
