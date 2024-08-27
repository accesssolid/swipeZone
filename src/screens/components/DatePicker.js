import React from "react";
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function DatePicker({
  isVisible,
  mode,
  onConfirm,
  onCancel,
  selectedDate,
  maxDate,
  minDate,
}) {
  return (
    <DateTimePickerModal
      isVisible={isVisible}
      mode={mode}
      onConfirm={onConfirm}
      onCancel={onCancel}
      locale="en-US"
      date={selectedDate}
      maximumDate={maxDate}
      minimumDate={minDate}
    />
  );
}
