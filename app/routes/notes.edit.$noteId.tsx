import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { useSubmit, Form } from "react-router-dom";
import { createNote, getNote, updateNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

import { useState } from "react";
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from "uuid";
export const supabase = createClient('https://lpbqbqcmlspixeiikhcb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYnFicWNtbHNwaXhlaWlraGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA2NDU1ODksImV4cCI6MTk5NjIyMTU4OX0.EIGOPYgY4iebJJ1jpJNCoioJZSE9XU83ZPWUhCsgUSk')


export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  

  const note = await getNote({ userId, id: params.noteId })||{};
  console.log(11, note);
  // note.userid = userId
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ note });
}


export async function action({ request }: ActionArgs) {

  const userId = await requireUserId(request);
  const formData = await request.formData();
  const id = formData.get("id");
  const title = formData.get("title");
  const body = formData.get("body");
  let image = formData.get("image");
  let noimage = formData.get("noimage");
  console.log(title, body, image, noimage);
  
  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { title: "Title is required", body: null } },
      { status: 400 }
    );
  }

  if (typeof body !== "string" || body.length === 0) {
    return json(
      { errors: { title: null, body: "Body is required" } },
      { status: 400 }
    );
  }
 
  const obj: any = { id, title, body, userId }
  // if (image){
  //   image = "https://lpbqbqcmlspixeiikhcb.supabase.co/storage/v1/object/public/files/" + image
  //   obj.img = image
  // }

  obj.img = image
  console.log(2, noimage);
  
  if (noimage=="true"){
    obj.img = ""
  }

  
  const note = await updateNote(obj);
  return redirect(`/notes/${note.id}`);
}

export default function EditNotePage() {

  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const idRef = React.useRef<HTMLTextAreaElement>(null);
  const titleRef = React.useRef<HTMLTextAreaElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  const imageRef = React.useRef<HTMLTextAreaElement>(null);
  const noimageRef = React.useRef<any>('false');
  const [file, setfile] = useState([]);
  const [db_fileName, db_setFileName] = useState([]);
  const submit = useSubmit();
 
  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  const handleFileSelected = (e) => {
    setfile(e.target.files[0]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log(file.length);

    let formData = new FormData();

    formData.set("id", idRef.current.value);
    formData.set("title", titleRef.current.value);
    formData.set("body", bodyRef.current.value);
    formData.set("noimage", noimageRef.current.checked);
    
    if (file.length !== 0) {
      const filename = `${uuidv4()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("files")
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false,
        });

      const filepath = data.path;
      formData.set("image", filepath);
    }

    console.log(noimageRef.current.checked);
    
    if (noimageRef.current.checked) {
      formData.set("image", "");
    }
   
    submit(
      formData, //Notice this change
      { method: "post" }
    );
};

  return (
    <Form
      name="form1"
      method="post"
      // onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <input
            ref={idRef}
            hidden
            name="id"
            defaultValue={data.note.id}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
          <span>Title: </span>
          <input
            ref={titleRef}
            id="title"
            name="title"
            defaultValue={data.note.title}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Body: </span>
          <textarea
            ref={bodyRef}
            name="body"
            defaultValue={data.note.body}
            rows={8}
            className="w-full flex-1 rounded-md border-0 text-gray-50 bg-slate-700 border-slate-800 px-2 py-2 !outline-none text-lg leading-6"
            aria-invalid={actionData?.errors?.body ? true : undefined}
            aria-errormessage={
              actionData?.errors?.body ? "body-error" : undefined
            }
          />
        </label>
       
        {actionData?.errors?.body && (
          <div className="pt-1 text-red-700" id="body-error">
            {actionData.errors.body}
          </div>
        )}
      </div>
      <div>
        <label>
          <span>Sem imagem: </span>
          <input ref={noimageRef} type="checkbox" id="noimage" name="noimage" value="true"/>
        </label>
      </div>
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Img: </span>
          <input
            ref={imageRef}
            name="image"
            defaultValue={data.note.img}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
          <input type="file" name="image" onChange={handleFileSelected} />
        </label>
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
