import { toast } from "sonner";

export const useToast = () => {
  return {
    success: (message: string, description?: string) => {
      toast.success(message, {
        description,
      });
    },
    error: (message: string, description?: string) => {
      toast.error(message, {
        description,
      });
    },
    warning: (message: string, description?: string) => {
      toast.warning(message, {
        description,
      });
    },
    info: (message: string, description?: string) => {
      toast.info(message, {
        description,
      });
    },
    default: (message: string, description?: string) => {
      toast(message, {
        description,
      });
    },
    promise: <T,>(
      promise: Promise<T>,
      {
        loading,
        success,
        error,
      }: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      }
    ) => {
      return toast.promise(promise, {
        loading,
        success,
        error,
      });
    },
  };
};
