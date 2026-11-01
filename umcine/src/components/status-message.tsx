interface StatusMessageProps {
    message: string;
    tone?: "default" | "error";
  }
  
  export function StatusMessage({ message, tone = "default" }: StatusMessageProps) {
    return (
      <p
        role={tone === "error" ? "alert" : "status"}
        className={tone === "error" ? "py-16 text-center text-red-600" : "py-16 text-center text-neutral-500"}
      >
        {message}
      </p>
    );
  }