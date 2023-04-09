import { useEffect, useState } from 'react';
import { useSubmit } from "react-router-dom";
import { Row, Col, Card, Form, InputGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { createClient } from '@supabase/supabase-js'
import { json } from "@remix-run/node";
import React from 'react';
import { v4 as uuidv4 } from "uuid";
import { ActionArgs, LoaderArgs } from '@remix-run/server-runtime';
import { getUserId } from "../session.server";
import  Modal  from "../components/modal"
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { house } from 'react-bootstrap-icons';
const CDNURL = "https://lpbqbqcmlspixeiikhcb.supabase.co/storage/v1/object/public/files/";
const supabase = createClient('https://lpbqbqcmlspixeiikhcb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYnFicWNtbHNwaXhlaWlraGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA2NDU1ODksImV4cCI6MTk5NjIyMTU4OX0.EIGOPYgY4iebJJ1jpJNCoioJZSE9XU83ZPWUhCsgUSk', {
    db: {
      schema: 'custom',
    },
    auth: {
      persistSession: true,
    },
  })

export async function loader({ request }: LoaderArgs) {
    const userId = await getUserId(request);
    console.log(1, userId);
    return json({userId: userId});
}

export default function imagemanager() {
    let submit = useSubmit();
    const data = useLoaderData<typeof loader>();
    const [ url, setUrl ] = useState("");
    const urlRef = React.useRef<HTMLTextAreaElement>(url);
    const formUploadRef = React.useRef<HTMLTextAreaElement>(null);
    const [filesData, setFilesData] = useState([]);
    const [file, setfile] = useState([]);
    const [user, setUser] = useState(data.userId);
    const [urlType, setUrlType] = useState('');
    const newFolderRef = React.useRef<HTMLTextAreaElement>(null);
    const uploadTxtRef = React.useRef<HTMLTextAreaElement>(null);
    const [show, setShow] = useState(false);
    useEffect(() => {
        // setUser(data.userId);
        list_files()
    },[])

    useEffect(() => {
        console.log(url);
        list_files()
    },[url])

    const handleFileSelected = (e) => {
        setfile(e.target.files[0]);
        console.log("!");
        // submit(formUploadRef)
    };



    const list_files = async () => {
        
        console.log(user, url);

        const { data, error } = await supabase
          .storage
          .from('files')
          .list(user + url, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
          })
      
        console.log(data);
        
        setFilesData(data)
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const filename = `${uuidv4()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("files")
          .upload(user + '/' + url + '/' + filename, file, {
            cacheControl: "3600",
            upsert: false,
          });
          list_files(user)
          setShow(false)
    };

    const newFolder = async (name) => {
        const { data, error } = await supabase.storage
          .from("files")
          .upload(user + '/' + url + '/' + name + '/.initial', '', {
            cacheControl: "3600",
            upsert: false,
          });
          list_files(user)
    }

    const deleteImage = async (imageName)  => {
        console.log(imageName);
        if (confirm('Confirma exclusão do arquivo:' + imageName)){
          const { data, error } = await supabase
        .storage
        .from('files')
        .remove([user + url])
      
        // const { data, error } = await supabase
        //   .storage
        //   .from('files')
        //   .remove(['005df6c1-5a87-4594-a00e-f2e10f6ef6f0-vestido-casual-16.jpg'])
        console.log(data, error);
        
        if(error) {
          alert(error);
        } else {
        // let a = url.split('/').pop()
        // alert(a)
        back()
        // setUrl(a.join('/'))
        //   list_files(user);
        }
        }
        
    }

    const copy = async () => {
        await navigator.clipboard.writeText(url);
        alert('Text copied');
    }

    const goUrl = async () => {
        alert(urlRef.current?.value)
        setUrl(urlRef.current?.value)
    }

    const goHome = async () => {
        setUrl("")
        setUrlType('folder')
    }

    const back = async () => {
        let a = url.split('/')
        let b = a.slice(0,-1).join('/')
        setUrl(b)
        setUrlType('folder')
    }

    const goNewFolder = () => {
       let a = prompt("Nome da pasta")
       newFolder(a)
    }

    const goDelete = () => {
        deleteImage(url)
    }

    const goUpload = () => {
        setShow(true)
        console.log(show);    
    }

    return (
        <div>
            <div style={{width: '80%', margin: 'auto', marginTop: '10px'}}>
                <h2>Gerenciador de arquivos</h2>{urlType}
            </div>
            {/* <h1>File manager</h1>{url}[{urlType}]<br/> */}
            
            <Modal title="Enviar arquivo" show={show} setShow={setShow} showFooterButtons={false}>
            <Form
                    ref={formUploadRef}
                    name="form1"
                    method="post"
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        width: "100%",
                    }}
                    >
                    <div>
                        {/* Nova pasta: <input type="text" ref={newFolderRef} name="newfolder" />
                        <button
                            onClick={()=>{newFolder()}}
                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
                            >
                            Nova pasta
                        </button> */}
                        <Form.Group controlId="formFileSm" className="mb-3">
                          {/* <Form.Label>Upload</Form.Label> */}
                          <Form.Control type="file" size="sm" name="image" onChange={(event)=>handleFileSelected(event)} accept="image"/>
                        </Form.Group>
                        {/* <label className="flex w-full flex-col gap-1">
                        <span>Img: </span>
                        <input type="file"  />
                        </label> */}
                        <button
                        type="submit"
                        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
                        >
                        Enviar arquivo
                        </button>
                    </div>
                </Form>
            </Modal>
            {/* <Button variant="primary" onClick={()=>teste()}>
              vai!
            </Button> */}
            {uploadTxtRef.current?.value}
            <div style={{width: '80%', margin: 'auto', marginTop: '10px'}}>
               
                <InputGroup className="mb-3">
                    <InputGroup.Text>
                        <Button variant="primary" onClick={() => goHome()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-house" viewBox="0 0 20 20">
                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                        </svg>
                        </Button>
                    </InputGroup.Text>
                    <InputGroup.Text>
                        <Button variant="primary" onClick={() => back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" class="bi bi-arrow-return-left" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z"/>
                            </svg>
                        </Button>
                    </InputGroup.Text>
                    <Form.Control
                        name="url" 
                        ref={urlRef}
                        defaultValue={url}
                    /> 
                    {(urlType=="img")&&
                    <InputGroup.Text>
                        <Button variant="primary" onClick={() =>  navigator.clipboard.writeText(urlRef.current.value)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard2-check" viewBox="0 0 16 16">
                            <path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5h3Z"/>
                            <path d="M3 2.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1H12a.5.5 0 0 0 0 1h.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-12Z"/>
                            <path d="M10.854 7.854a.5.5 0 0 0-.708-.708L7.5 9.793 6.354 8.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3Z"/>
                            </svg>
                        </Button>
                    </InputGroup.Text>
                    }
                    <InputGroup.Text>
                        <Button variant="primary" onClick={() => goUrl()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-box-arrow-in-right" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"/>
                            <path fill-rule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                            </svg>
                        </Button>
                    </InputGroup.Text>
                    {(urlType=="folder")&&
                        <>
                        <InputGroup.Text>
                            <Button variant="primary" onClick={() => goNewFolder()}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-folder-plus" viewBox="0 0 20 20">
                                <path d="m.5 3 .04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2Zm5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19c-.24 0-.47.042-.683.12L1.5 2.98a1 1 0 0 1 1-.98h3.672Z"/>
                                <path d="M13.5 9a.5.5 0 0 1 .5.5V11h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 1 1-1 0V12h-1.5a.5.5 0 0 1 0-1H13V9.5a.5.5 0 0 1 .5-.5Z"/>
                                </svg>
                            </Button>
                        </InputGroup.Text>
                        <InputGroup.Text>
                            <Button variant="primary" onClick={() => goUpload()}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-upload" viewBox="0 0 20 20">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                                </svg>
                            </Button>
                        </InputGroup.Text>
                        </>
                    }
                    <InputGroup.Text>
                        <Button variant="primary" onClick={() => goDelete()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                            </svg>
                        </Button>
                    </InputGroup.Text>
                </InputGroup>
                <br/>
                <Row xs={1} md={4} className="g-4">
                {urlType!=='file'&&filesData.filter((x)=>!x.name.includes('undefined')&&x.name!=='.initial').map((image) => {
                    return (
                    <Col key={CDNURL + "/" + image.name}>
                     {!image.id?
                        <Card>
                            {/* <Card.Img variant="top" src="/img/folder2.png" style={{width: '50', height: '30'}} onClick={() => {setUrl(url + '/' + image.name); }} /> */}
                            <Card.Body>
                                <img src="/img/folder2.png" onClick={() => {setUrl(url + '/' + image.name); setUrlType('folder')}}  alt=""/>
                                <InputGroup className="mb-3">
                                    {image.name}
                                    {/* <InputGroup.Text id="basic-addon1">{image.name}</InputGroup.Text> */}
                                </InputGroup>   
                                {/* <Button key={CDNURL + "/" + image.name} variant="danger" onClick={() => deleteImage(image.name)}>Delete Image</Button> */}
                            </Card.Body>
                        </Card>
                        :
                        <Card>
                            <Card.Img variant="top" style={{width: '50vw', height: '30vh', objectFit: 'cover'}} src={CDNURL + "/" + user + '/' + url + '/' + image.name} onClick={() => {setUrlType('img'); setUrl(url + '/' + image.name)}} />
                            <Card.Body>
                                {/* <InputGroup className="mb-3">
                                    <InputGroup.Text id="basic-addon1">URL</InputGroup.Text>
                                        <Form.Control
                                            name="url"
                                            defaultValue={`${image.name}`}
                                        />
                                </InputGroup>    */}
                                {/* <Button key={CDNURL + "/" + image.name} variant="danger" onClick={() => deleteImage(image.name)}>Delete Image</Button> */}
                            </Card.Body>
                        </Card>
                     }
                    </Col>
                    )
                })}
                </Row>
                {urlType=='img'&&
                    <img src={CDNURL + "/" +user + '/' + url} />
                }



                
            </div>
        </div>
    )
}