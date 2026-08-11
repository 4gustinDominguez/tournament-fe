"use client";

import { toast } from "@/components/ui/use-toast";

export const notify = {
  success: (message: string, description?: string) => {
    toast({
      variant: "success",
      title: message,
      description,
    });
  },

  error: (message: string, description?: string) => {
    toast({
      variant: "destructive",
      title: message,
      description,
    });
  },

  info: (message: string, description?: string) => {
    toast({
      title: message,
      description,
    });
  },

  warning: (message: string, description?: string) => {
    toast({
      variant: "warning",
      title: message,
      description,
    });
  },

  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    },
  ): Promise<T> => {
    try {
      const data = await promise;
      const successMsg =
        typeof messages.success === "function"
          ? messages.success(data)
          : messages.success;
      toast({
        variant: "success",
        title: successMsg,
      });
      return data;
    } catch (err) {
      const errorMsg =
        typeof messages.error === "function"
          ? messages.error(err)
          : messages.error;
      toast({
        variant: "destructive",
        title: errorMsg,
      });
      throw err;
    }
  },
};
