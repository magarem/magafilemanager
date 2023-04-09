import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import { useSubmit, Form } from "react-router-dom";
import { createNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

import { useState } from "react";
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from "uuid";
// import { Col, Card, Button, Row } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Card } from "react-bootstrap";
// import Row from "react-bootstrap/esm/Row";
// import { Col, Card } from "react-bootstrap";
const CDNURL = "https://lpbqbqcmlspixeiikhcb.supabase.co/storage/v1/object/public/files/";
export const supabase = createClient('https://lpbqbqcmlspixeiikhcb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYnFicWNtbHNwaXhlaWlraGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA2NDU1ODksImV4cCI6MTk5NjIyMTU4OX0.EIGOPYgY4iebJJ1jpJNCoioJZSE9XU83ZPWUhCsgUSk')


export async function action({ request }: ActionArgs) {

  const userId = await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");
  const image = formData.get("image");
  console.log(title, body, image);
  
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
  // img = "https://lpbqbqcmlspixeiikhcb.supabase.co/storage/v1/object/public/files/" + image
  const note = await createNote({ title, body, img:image, userId });

  return redirect(`/notes/${note.id}`);
}

export default function NewNotePage() {

  const actionData = useActionData<typeof action>();
  const titleRef = React.useRef<HTMLTextAreaElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  const imageRef = React.useRef<HTMLTextAreaElement>(null);
  const [file, setfile] = useState([]);
  const [filesData, setFilesData] = useState([]);
  const [db_fileName, db_setFileName] = useState([]);
  const submit = useSubmit();

  React.useEffect(() => {
    
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

 
const handleSubmit = async (e: any) => {
    e.preventDefault();
    // const filename = `${uuidv4()}-${file.name}`;
    // const { data, error } = await supabase.storage
    //   .from("files")
    //   .upload('maguete/' + filename, file, {
    //     cacheControl: "3600",
    //     upsert: false,
    //   });

    // const filepath = data.path;

    let formData = new FormData();
    formData.set("title", titleRef.current.value);
    formData.set("body", bodyRef.current.value);
    formData.set("image", imageRef.current.value);
    // submit(formData);
    // const request = new XMLHttpRequest();
    // request.open("POST", "/notes/new");
    // request.send(formData);
   
    submit(
      formData, //Notice this change
      { method: "post" }
    );

    // fetch('./new', {
    //   method: 'POST',
    //   headers: {
    //       'Accept': 'application/json',
    //       'Content-Type': 'application/json'
    //   },
    //   body: `{
    //     "title": '78912'       }`,
    //  })
    //  .then(response => response.json())
    //  .then(response => console.log(JSON.stringify(response)))

    // e.target.title.value = "Fidelitos"
    // save filepath in database
};

const handleFileSelected = (e) => {
  setfile(e.target.files[0]);
};

const list_files = async () => {
  const { data, error } = await supabase
    .storage
    .from('files')
    .list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    })
  console.log(data);
  setFilesData(data)
}
// const handleSubmit = async (e: any) => {
//   e.preventDefault();
//   const filename = `${uuidv4()}-${file.name}`;
//   const { data, error } = await supabase.storage
//     .from("files")
//     .upload('' + filename, file, {
//       cacheControl: "3600",
//       upsert: false,
//     });
// };

const deleteImage = async (imageName)  => {
  console.log(imageName);
  if (confirm('Confirma exclusão do arquivo:' + imageName)){
    const { data, error } = await supabase
  .storage
  .from('files')
  .remove([imageName])

  // const { data, error } = await supabase
  //   .storage
  //   .from('files')
  //   .remove(['005df6c1-5a87-4594-a00e-f2e10f6ef6f0-vestido-casual-16.jpg'])
  console.log(data, error);
  
  if(error) {
    alert(error);
  } else {
    list_files();
  }
  }
  
}
  return (
    <div>
      
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
            <span>Title: </span>
            <input
              ref={titleRef}
              id="title"
              name="title"
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
              rows={8}
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
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
        <label className="flex w-full flex-col gap-1">
          <span>Img: </span>
          <input
            ref={imageRef}
            name="image"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
      </div>

        {/* <div>
          <label className="flex w-full flex-col gap-1">
            <span>Img: </span>
            <input type="file" name="image" onChange={handleFileSelected} />
          </label>
        </div> */}

        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Save
          </button>
          
        </div>
      
      </Form>
      {/* <div style={{width: '80%', margin: 'auto', marginTop: '100px'}}>
            <Row xs={1} md={4} className="g-4">
              {filesData.filter((x)=>!x.name.includes('undefined')).map((image) => {
                return (
                  <Col key={CDNURL + "/" + image.name}>
                    <Card >
                      <Card.Img variant="top" src={CDNURL + "/" + image.name} />
                      <Card.Body>
                        <Button key={CDNURL + "/" + image.name} variant="danger" onClick={() => deleteImage(image.name)}>Delete Image</Button>
                       </Card.Body>
                    </Card>
                  </Col>
                )
              })}
            </Row>
            
        </div> */}
    </div>
  );
}
