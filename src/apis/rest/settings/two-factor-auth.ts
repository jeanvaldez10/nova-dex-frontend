import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { z } from "zod";
import { getBaseURLBasedOnRegion } from "../../../utils/getBaseURLBasedOnRegion";

// #################### VALIDATOR📜 ####################
const baseSchema = z.object({
  code: z.string().length(6, "Passcode must be exactly 6 digits"),
  confirmCode: z
    .string()
    .length(6, "Confirmation code must be exactly 6 digits"),
  email: z.string().email("Please enter a valid email address"),
});

export const passcodeSchema = baseSchema.pick({
  code: true,
});

export const confirmPasscodeSchema = baseSchema
  .pick({
    code: true,
    confirmCode: true,
  })
  .refine((data) => data.code === data.confirmCode, {
    message: "Passcodes do not match",
    path: ["confirmCode"],
  });

export const configure2FASchema = baseSchema.refine(
  (data) => data.code === data.confirmCode,
  {
    message: "Passcodes do not match",
    path: ["confirmCode"],
  },
);

export const emailSchema = configure2FASchema;

export const completeSetupSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// #################### TYPES📅 ####################
export type Configure2FARequest = z.infer<typeof configure2FASchema>;
export type Complete2FASetupRequest = z.infer<typeof completeSetupSchema>;

interface BaseResponse {
  success: boolean;
  message: string;
}

interface Setup2FAResponse extends BaseResponse {
  redirectUrl?: string;
}

interface TwoFactorStatus {
  enabled: boolean;
}

// #################### API🔥 ####################
export const configure2FA = async (
  request: Configure2FARequest,
): Promise<Setup2FAResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/2fa/setup");

  try {
    const { data } = await axios.post<Setup2FAResponse>(API_BASE_URL, request, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to setup 2FA");
    }
    throw new Error("Failed to setup 2FA");
  }
};

export const complete2FASetup = async (
  request: Complete2FASetupRequest,
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/2fa/complete");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, request, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to complete 2FA setup",
      );
    }
    throw new Error("Failed to complete 2FA setup");
  }
};

export const get2FAStatus = async (
  token?: string,
): Promise<TwoFactorStatus> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/2fa/status");

  try {
    const { data } = await axios.get<TwoFactorStatus>(API_BASE_URL, {
      withCredentials: false,
      headers: {
        "X-Nova-Session": token || undefined,
      },
    });
    return data;
  } catch (error) {
    console.warn(error);
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to get 2FA status",
      );
    }
    throw new Error("Failed to get 2FA status");
  }
};
