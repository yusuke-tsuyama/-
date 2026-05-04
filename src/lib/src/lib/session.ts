export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("nihongo-checker-session-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("nihongo-checker-session-id", id);
  }
  return id;
}

