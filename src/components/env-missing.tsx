import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function EnvMissing({ names }: { names: string[] }) {
  if (names.length === 0) return null;

  return (
    <Alert>
      <AlertTitle>Environment not configured</AlertTitle>
      <AlertDescription>
        Set{" "}
        {names.map((name, index) => (
          <span key={name}>
            {index > 0 ? ", " : null}
            <code>{name}</code>
          </span>
        ))}{" "}
        in <code>.env.local</code> (see README) and restart the app. The UI builds
        without live credentials; data pages need Supabase Postgres and Auth.
      </AlertDescription>
    </Alert>
  );
}
