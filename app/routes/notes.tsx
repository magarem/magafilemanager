import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getNoteListItems } from "~/models/note.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const noteListItems = await getNoteListItems({ userId });
  return json({ noteListItems });
}

export default function NotesPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex pt-6 items-center justify-between bg-slate-800 p-2 text-white no-underline">
        <h5 className="text-1xl font-sans	pt-1 pl-2">
          <Link to="." className="no-underline text-yellow-500">MW Notes</Link>
        </h5>
        {/* <p className="pt-2 text-xs">{user.email}</p> */}
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-1 text-blue-100 hover:bg-blue-500 active:bg-blue-600 text-xs"
          >
            {user.email}
          </button>
        </Form>
      </header>

      <main className="flex h-full">
        <div className="h-full w-81 ">
          <Link to="new" className="no-underline block p-2 ml-7 text-base text-greew-300">
            + Nova nota
          </Link>

          {/* <hr /> */}

          {data.noteListItems.length === 0 ? (
            <p className="p-2">Nenhuma nota ainda</p>
          ) : (
            <ol>
              {data.noteListItems.map((note) => (
                <li key={note.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block no-underline p-1 text-base ${isActive ? "text-cyan-600" : ""}`
                    }
                    to={note.id}
                  >
                     {note.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
