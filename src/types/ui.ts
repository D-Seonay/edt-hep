import type { TextareaHTMLAttributes } from "react";
import type { DialogProps } from "@radix-ui/react-dialog";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export interface CommandDialogProps extends DialogProps {}

export interface AdBannerProps {
  username: string;
}
