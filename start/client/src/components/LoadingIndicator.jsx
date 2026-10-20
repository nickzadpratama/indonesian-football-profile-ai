import footballLoading from "./assets/football-loading.svg";

export default function LoadingIndicator({
  label = "Loading…",
  className = "h-32 w-32",
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center align-middle ${className}`}
    >
      <img src={footballLoading} alt="" aria-hidden="true" className="h-full w-full object-contain" />
    </span>
  );
}
