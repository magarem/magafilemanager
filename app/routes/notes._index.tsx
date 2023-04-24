import { Link } from "@remix-run/react";

export default function NoteIndexPage() {
  return (
    <p>
      Selecione uma nota, ou{" "}
      <Link to="new" className="text-blue-500 underline">
        crie uma nova.
      </Link>
    </p>
  );
}
