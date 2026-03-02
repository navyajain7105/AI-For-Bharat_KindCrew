/**
 * Sonner Toast Usage Examples
 *
 * Import the hook in any component:
 * import { useToast } from "@/hooks/useToast";
 *
 * Or import directly from sonner:
 * import { toast } from "sonner";
 */

// Example 1: Using the useToast hook
import { useToast } from "@/hooks/useToast";

export function ExampleComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("Success!", "Your action completed successfully");
  };

  const handleError = () => {
    toast.error("Error!", "Something went wrong");
  };

  const handleWarning = () => {
    toast.warning("Warning!", "Please check your input");
  };

  const handleInfo = () => {
    toast.info("Info", "This is an informational message");
  };

  const handleDefault = () => {
    toast.default("Default Toast", "This is a default toast message");
  };

  // Promise toast - shows loading, then success or error
  const handlePromise = async () => {
    const myPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ name: "Sonner" }), 2000),
    );

    toast.promise(myPromise, {
      loading: "Loading...",
      success: "Data loaded successfully!",
      error: "Error loading data",
    });
  };

  return <div>Example component with toasts</div>;
}

// Example 2: Using toast directly (without hook)
import { toast } from "sonner";

export function DirectToastExample() {
  const showToast = () => {
    // Simple toast
    toast("Event has been created");

    // Success toast
    toast.success("Account created successfully");

    // Error toast
    toast.error("Unable to create account");

    // Warning toast
    toast.warning("Check your credentials");

    // Info toast
    toast.info("New version available");

    // With description
    toast.success("Success", {
      description: "Your changes have been saved",
    });

    // With action button
    toast("Event created", {
      action: {
        label: "Undo",
        onClick: () => console.log("Undo"),
      },
    });

    // Promise toast
    toast.promise(fetch("/api/data"), {
      loading: "Loading data...",
      success: "Data loaded",
      error: "Failed to load",
    });

    // Dismissible
    toast("Event created", {
      duration: 5000, // 5 seconds
    });

    // Custom positioning
    toast("Bottom Center", {
      position: "bottom-center",
    });
  };

  return <button onClick={showToast}>Show Toast</button>;
}

// Example 3: Integration with form submission
export function FormExample() {
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        body: JSON.stringify({ data: "..." }),
      });

      if (response.ok) {
        toast.success("Form submitted!", "Your data has been saved");
      } else {
        toast.error("Submission failed", "Please try again");
      }
    } catch (error) {
      toast.error("Network error", "Check your connection");
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// Example 4: Integration with async operations
export function AsyncExample() {
  const toast = useToast();

  const deleteItem = async (id: string) => {
    const deletePromise = fetch(`/api/items/${id}`, {
      method: "DELETE",
    }).then((res) => res.json());

    toast.promise(deletePromise, {
      loading: "Deleting item...",
      success: "Item deleted successfully",
      error: (err) => `Failed to delete: ${err.message}`,
    });
  };

  return <button onClick={() => deleteItem("123")}>Delete</button>;
}
