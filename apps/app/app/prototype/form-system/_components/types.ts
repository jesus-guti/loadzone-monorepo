/** JES-68 FormActionResult — prototype-local copy (not promoted). */
export type FormActionResult = {
  success: boolean;
  fieldErrors?: Record<string, string>;
  formError?: string;
  toastError?: string;
};

export type SettingsFieldResult = {
  success: boolean;
  error?: string;
};
